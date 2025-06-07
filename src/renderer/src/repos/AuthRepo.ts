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
        // Obtener y guardar el usuario actual inmediatamente
        const currentUser = await getCurrentUser();
        if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
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
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if(error){
            console.error('Error obteniendo usuario:', error);
            return null;
        }
        
        return user;
    } catch (error) {
        console.error('Error en getCurrentUser:', error);
        return null;
    }
}

export const isAuthenticated = (): boolean => {
    try {
        const authData = localStorage.getItem('authData');
        if(!authData) return false;
        
        const parsed = JSON.parse(authData);
        return !!(parsed.session && parsed.session.access_token);
    } catch (error) {
        console.error('Error verificando autenticación:', error);
        return false;
    }
}
