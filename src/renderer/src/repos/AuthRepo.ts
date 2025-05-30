/* eslint-disable prettier/prettier */
 
import { supabase } from '@renderer/data/supabaseClient'
import { User } from '@supabase/supabase-js'

export const signIn = async (Email: string, Password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: Email, 
        password: Password
    });

    if(error){
        throw new Error(error.message)
    }
    
    // Guardar datos de autenticación en localStorage
    if(data.session) {
        localStorage.setItem('authData', JSON.stringify(data));
    }
}

export const signOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    
    if(error){
        throw new Error(error.message)
    }
    
    // Limpiar localStorage
    localStorage.removeItem('authData');
}

export const getCurrentUser = async (): Promise<User | null> => {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if(error){
        throw new Error(error.message)
    }
    
    return user;
}

export const isAuthenticated = (): boolean => {
    const authData = localStorage.getItem('authData');
    if(!authData) return false;
    
    try {
        const parsed = JSON.parse(authData);
        return parsed.session && parsed.session.access_token;
    } catch {
        return false;
    }
}
