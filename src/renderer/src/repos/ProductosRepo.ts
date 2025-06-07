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
        // Validaciones básicas
        if (!producto.nombre?.trim()) {
            throw new Error('El nombre del producto es requerido');
        }

        if (typeof producto.precio === 'number' && producto.precio < 0) {
            throw new Error('El precio no puede ser negativo');
        }

        if (typeof producto.cantidad_stock === 'number' && producto.cantidad_stock < 0) {
            throw new Error('La cantidad en stock no puede ser negativa');
        }

        if (!producto.categoria_id) {
            throw new Error('La categoría es requerida');
        }

        try {
            const { data, error } = await supabase
                .from('productos')
                .insert([{
                    ...producto,
                    estado: 1,
                    cantidad_stock: producto.cantidad_stock ?? 0,
                    precio: producto.precio ?? 0
                }])
                .select()
                .single();

            if (error) {
                console.error('Error al crear producto:', error);
                throw new Error(error.message || 'Error al crear el producto');
            }

            if (!data) {
                throw new Error('No se pudo crear el producto');
            }

            return data;
        } catch (error) {
            console.error('Error en createProducto:', error);
            throw error;
        }
    },

    updateProducto: async (id: number, producto: Partial<ProductoDTO>): Promise<Product> => {
        // Clonamos y eliminamos campos problemáticos
        const productoLimpio = { ...producto };
        delete productoLimpio.id;
        delete productoLimpio.categoria; // Si no existe en tu tabla

        console.log("producto limpio a enviar", productoLimpio)

        const { data, error } = await supabase
            .from('productos')
            .update(productoLimpio)
            .eq('id', id)
            .select('*')

        if (error) throw error;
        if (!data) throw new Error('No se pudo actualizar el producto');

        return data[0];
    },


    deleteProducto: async (id: number): Promise<boolean> => {
        if (!id) {
            throw new Error('ID de producto requerido');
        }

        try {
            // Primero verificamos si el producto existe
            const { error: checkError } = await supabase
                .from('productos')
                .select('imagen')
                .eq('id', id)
                .single();

            if (checkError) {
                throw new Error('Error al verificar el producto');
            }

            // Realizamos el soft delete actualizando el estado a 0
            const { error } = await supabase
                .from('productos')
                .update({ estado: 0 })
                .eq('id', id);

            if (error) {
                throw new Error(error.message || 'Error al eliminar el producto');
            }

            return true;
        } catch (error) {
            console.error('Error en deleteProducto:', error);
            throw error;
        }
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