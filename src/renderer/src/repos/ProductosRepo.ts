/* eslint-disable prettier/prettier */
import { supabase } from "@renderer/data/supabaseClient";
import { Database, TablesInsert } from "@renderer/shared/types/database";
import { GetProductsParams } from "@renderer/models/Productos/DTOs/GetProductosParams";

export type Product = Database['public']['Tables']['productos']['Row'];
export type ProductoDTO = TablesInsert<'productos'>

export interface GetProductsResponse {
    data: Product[];
    count: number;
}

export const ProductosRepository = {
    getProductos: async ({
        nombre,
        categoria,
    }: GetProductsParams): Promise<GetProductsResponse> => {
        let query = supabase
            .from('productos')
            .select('*')
            .eq('estado', 1)
            .order('id', { ascending: true });

        // Aplicar filtros solo si se proporcionan valores válidos
        if (nombre && nombre.trim() !== '') {
            query = query.ilike('nombre', `%${nombre.trim().toLowerCase()}%`);
        }

        // Solo aplicar filtro de categoría si tiene un valor válido y no es la categoría "Todos" (id: 1)
        if (categoria && categoria !== 1) {
            query = query.eq('categoria_id', categoria);
        }

        const { data, error, count } = await query;

        if (error) {
            throw error;
        }

        return {
            data: data || [],
            count: count || 0
        };
    },

    createProducto: async (producto: ProductoDTO): Promise<Product> => {
        const { data, error } = await supabase
            .from('productos')
            .insert([producto])
            .select()
            .single();

        if (error) {
            throw error;
        }

        if (!data) {
            throw new Error('No se pudo crear el producto');
        }

        return data;
    },

    updateProducto: async (id: number, producto: Partial<ProductoDTO>): Promise<Product> => {
        const { data, error } = await supabase
            .from('productos')
            .update(producto)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        if (!data) {
            throw new Error('No se pudo actualizar el producto');
        }

        return data;
    },

    deleteProducto: async (id: number): Promise<boolean> => {
        const { data, error } = await supabase
            .from('productos')
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        if (!data) {
            throw new Error('No se pudo actualizar el producto');
        }

        return true;
    },

    deleteImage: async (fileName: string): Promise<void> => {
        const { error } = await supabase.storage
            .from('productos')
            .remove([fileName]);

        if (error) {
            throw error;
        }
    },

    uploadImage: async (file: File): Promise<string> => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('productos')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('productos')
            .getPublicUrl(filePath);

        return publicUrl;
    }
}