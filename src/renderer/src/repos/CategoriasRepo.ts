/* eslint-disable prettier/prettier */
import { supabase } from "@renderer/data/supabaseClient";
import { Database } from "@renderer/shared/types/database";

type Categoria = Database['public']['Tables']['categorias']['Row'];

export const categoriasRepository = {
    getCategorias: async():Promise<Categoria[]> => {
        const { data, error } = await supabase
            .from('categorias')
            .select('id, descripcion, empresa_id , estado')
            .order('descripcion', { ascending: true});

        if(error)
        {
            throw error;
        }
        return data || [];
    },


    createCategoria: async( descripcion: string):Promise<Categoria> => {
        const {data, error } = await supabase
            .from('categorias')
            .insert([{descripcion: descripcion, estado: 1}])
            .select()
            .single();

        if (error) throw error;

        if (data) return data;

        throw new Error("No se devolverion datos de la categoria nueva creada.");
    }
}