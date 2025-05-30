/* eslint-disable prettier/prettier */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { ProductosRepository } from '../repos/ProductosRepo';
import { GetProductsParams } from '@renderer/models/Productos/DTOs/GetProductosParams';
import { ProductoDTO } from '../repos/ProductosRepo';

interface ProductosFilters extends GetProductsParams {
    pageParam?: number;
}

// Query Keys Factory
export const productosKeys = {
    all: ['productos'] as const,
    lists: () => [...productosKeys.all, 'list'] as const,
    list: (filters: ProductosFilters) => [...productosKeys.lists(), filters] as const,
    details: () => [...productosKeys.all, 'detail'] as const,
    detail: (id: number) => [...productosKeys.details(), id] as const,
};

// Hook principal para consultar productos - PATRÓN REACTIVO CORRECTO
export const useProductos = (filters: ProductosFilters = {}) => {
    const {
        data,
        isLoading,
        error,
        refetch,
        isFetching
    } = useQuery({
        queryKey: productosKeys.list(filters),
        queryFn: () => ProductosRepository.getProductos(filters),
        staleTime: 5 * 60 * 1000, // 5 minutos
        gcTime: 10 * 60 * 1000, // 10 minutos
        retry: 2,
        // La query se ejecuta automáticamente cuando cambian los filtros
    });

    return {
        productos: data?.data || [],
        count: data?.count || 0,
        loading: isLoading,
        fetching: isFetching,
        error: error?.message || null,
        refetch
    };
};

// Hook para obtener un producto específico
// export const useProducto = (id: number, enabled: boolean = true) => {
//     return useQuery({
//         queryKey: productosKeys.detail(id),
//         queryFn: () => ProductosRepository.getProducto(id),
//         enabled: enabled && !!id,
//         staleTime: 5 * 60 * 1000,
//         gcTime: 10 * 60 * 1000,
//     });
// };

// Hook para búsqueda con debounce (opcional)
export const useProductosSearch = (searchTerm: string, delay: number = 500) => {
    const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTerm(searchTerm);
        }, delay);

        return () => clearTimeout(timer);
    }, [searchTerm, delay]);

    return useProductos({ nombre: debouncedTerm });
};

// Hook para crear productos
export const useCreateProducto = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (producto: ProductoDTO) => ProductosRepository.createProducto(producto),
        onSuccess: (newProduct) => {
            // Invalidar todas las listas de productos
            queryClient.invalidateQueries({ queryKey: productosKeys.lists() });
            
            // Agregar el nuevo producto al caché
            queryClient.setQueryData(
                productosKeys.detail(newProduct.id),
                newProduct
            );
        },
        onError: (error) => {
            console.error('Error al crear producto:', error);
        }
    });
};

// Hook para actualizar productos
export const useUpdateProducto = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, producto }: { id: number; producto: Partial<ProductoDTO> }) =>
            ProductosRepository.updateProducto(id, producto),
        onSuccess: (updatedProduct, { id }) => {
            // Actualizar el producto específico en caché
            queryClient.setQueryData(
                productosKeys.detail(id),
                updatedProduct
            );
            
            // Invalidar todas las listas para reflejar los cambios
            queryClient.invalidateQueries({ queryKey: productosKeys.lists() });
        },
        onError: (error) => {
            console.error('Error al actualizar producto:', error);
        }
    });
};

// Hook para eliminar productos
export const useDeleteProducto = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => ProductosRepository.deleteProducto(id),
        onSuccess: (_, id) => {
            // Remover de caché
            queryClient.removeQueries({ queryKey: productosKeys.detail(id) });
            
            // Invalidar listas
            queryClient.invalidateQueries({ queryKey: productosKeys.lists() });
        },
        onError: (error) => {
            console.error('Error al eliminar producto:', error);
        }
    });
};

// Hook para subir imágenes
export const useUploadImage = () => {
    return useMutation({
        mutationFn: (file: File) => ProductosRepository.uploadImage(file),
        onError: (error) => {
            console.error('Error al subir imagen:', error);
        }
    });
};

// Hook para eliminar imágenes
export const useDeleteImage = () => {
    return useMutation({
        mutationFn: (fileName: string) => ProductosRepository.deleteImage(fileName),
        onError: (error) => {
            console.error('Error al eliminar imagen:', error);
        }
    });
};

// Hook combinado para operaciones CRUD completas
export const useProductoOperations = () => {
    const queryClient = useQueryClient();
    
    const createMutation = useCreateProducto();
    const updateMutation = useUpdateProducto();
    const deleteMutation = useDeleteProducto();
    const uploadImageMutation = useUploadImage();
    const deleteImageMutation = useDeleteImage();

    // Función helper para crear producto con imagen
    const createProductoWithImage = useCallback(async (
        producto: Omit<ProductoDTO, 'imagen'>,
        imageFile?: File
    ) => {
        try {
            let imagenUrl = '';
            
            if (imageFile) {
                imagenUrl = await uploadImageMutation.mutateAsync(imageFile);
            }

            const productoCompleto: ProductoDTO = {
                ...producto,
                imagen: imagenUrl
            };

            return await createMutation.mutateAsync(productoCompleto);
        } catch (error) {
            // Si falla la creación pero la imagen se subió, intentar eliminarla
            if (imageFile && uploadImageMutation.isSuccess) {
                try {
                    const fileName = uploadImageMutation.data?.split('/').pop();
                    if (fileName) {
                        await deleteImageMutation.mutateAsync(fileName);
                    }
                } catch (deleteError) {
                    console.error('Error al limpiar imagen después de fallo:', deleteError);
                }
            }
            throw error;
        }
    }, [createMutation, uploadImageMutation, deleteImageMutation]);

    // Función helper para actualizar producto con nueva imagen
    const updateProductoWithImage = useCallback(async (
        id: number,
        producto: Partial<Omit<ProductoDTO, "id">>,
        newImageFile?: File,
        oldImageFileName?: string
    ) => {
        try {
            let imagenUrl = producto.imagen;
            
            if (newImageFile) {
                // Subir nueva imagen
                imagenUrl = await uploadImageMutation.mutateAsync(newImageFile);
                
                // Eliminar imagen anterior si existe
                if (oldImageFileName) {
                    await deleteImageMutation.mutateAsync(oldImageFileName);
                }
            }

            const productoActualizado = {
                ...producto,
                ...(imagenUrl && { imagen: imagenUrl })
            };

            return await updateMutation.mutateAsync({ id, producto: productoActualizado });
        } catch (error) {
            // Si falla la actualización pero se subió nueva imagen, intentar eliminarla
            if (newImageFile && uploadImageMutation.isSuccess) {
                try {
                    const fileName = uploadImageMutation.data?.split('/').pop();
                    if (fileName) {
                        await deleteImageMutation.mutateAsync(fileName);
                    }
                } catch (deleteError) {
                    console.error('Error al limpiar nueva imagen después de fallo:', deleteError);
                }
            }
            throw error;
        }
    }, [updateMutation, uploadImageMutation, deleteImageMutation]);

    const isLoading = createMutation.isPending || 
                     updateMutation.isPending || 
                     deleteMutation.isPending ||
                     uploadImageMutation.isPending ||
                     deleteImageMutation.isPending;

    return {
        // Operaciones básicas
        createProducto: createMutation.mutate,
        createProductoAsync: createMutation.mutateAsync,
        updateProducto: updateMutation.mutate,
        updateProductoAsync: updateMutation.mutateAsync,
        deleteProducto: deleteMutation.mutate,
        deleteProductoAsync: deleteMutation.mutateAsync,
        uploadImage: uploadImageMutation.mutate,
        uploadImageAsync: uploadImageMutation.mutateAsync,
        deleteImage: deleteImageMutation.mutate,
        deleteImageAsync: deleteImageMutation.mutateAsync,
        
        // Operaciones combinadas
        createProductoWithImage,
        updateProductoWithImage,
        
        // Estados
        isLoading,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isUploadingImage: uploadImageMutation.isPending,
        isDeletingImage: deleteImageMutation.isPending,
        
        // Errores
        createError: createMutation.error,
        updateError: updateMutation.error,
        deleteError: deleteMutation.error,
        uploadImageError: uploadImageMutation.error,
        deleteImageError: deleteImageMutation.error,
        
        // Resetear estados
        resetErrors: () => {
            createMutation.reset();
            updateMutation.reset();
            deleteMutation.reset();
            uploadImageMutation.reset();
            deleteImageMutation.reset();
        },
        
        // Invalidar caché
        invalidateAll: () => {
            queryClient.invalidateQueries({ queryKey: productosKeys.all });
        }
    };
};

// Hook utilitario para invalidar consultas de productos
export const useInvalidateProductos = () => {
    const queryClient = useQueryClient();
    
    return useCallback(() => {
        queryClient.invalidateQueries({ queryKey: productosKeys.all });
    }, [queryClient]);
};