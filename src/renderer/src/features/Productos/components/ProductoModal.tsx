/* eslint-disable prettier/prettier */
import * as React from 'react';
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Option,
  Switch,
  Button,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  Box,
  FormHelperText,
  Card,
  CardContent,
} from '@mui/joy';
import { Database } from '../../../shared/types/database';
import { useCreateProducto, useUpdateProducto, productosKeys, useUploadImage, useDeleteImage } from '@renderer/services/useProductos';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, X } from 'lucide-react';


type ProductoRow = Database['public']['Tables']['productos']['Row'];
type ProductoInsert = Database['public']['Tables']['productos']['Insert'];
type ProductoUpdate = Database['public']['Tables']['productos']['Update'];

interface Categoria {
  id: number;
  descripcion: string;
}

interface ProductoModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (producto: ProductoInsert | ProductoUpdate) => void;
  producto?: ProductoRow | null; // null o undefined para crear, objeto para editar
  categorias: Categoria[];
  loading?: boolean;
  error?: string | null;
}

interface FormData {
  nombre: string;
  descripcion: string;
  precio: string;
  cantidad_stock: string;
  stock: boolean;
  categoria: string;
  categoria_id: string;
  imagen: string;
}

interface FormErrors {
  nombre?: string;
  precio?: string;
  cantidad_stock?: string;
  categoria_id?: string;
}

export default function ProductoModal({
  open,
  onClose,
  onSubmit,
  producto = null,
  categorias = [],
  loading = false,
  error = null,
}: ProductoModalProps): React.JSX.Element {
  const isEditing = Boolean(producto);
  const queryClient = useQueryClient();
  const uploadImageMutation = useUploadImage();
  const deleteImageMutation = useDeleteImage();
  
  // Estado del formulario
  const [formData, setFormData] = React.useState<FormData>({
    nombre: '',
    descripcion: '',
    precio: '',
    cantidad_stock: '',
    stock: true,
    categoria: '',
    categoria_id: '',
    imagen: '',
  });

  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [alert, setAlert] = React.useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  const [formErrors, setFormErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const updateProductoMutation = useUpdateProducto();
  const createProductoMutation = useCreateProducto();

  // Resetear formulario cuando se abre/cierra el modal o cambia el producto
  React.useEffect(() => {
    if (open) {
      if (isEditing && producto) {
        setFormData({
          nombre: producto.nombre || '',
          descripcion: producto.descripcion || '',
          precio: producto.precio?.toString() || '',
          cantidad_stock: producto.cantidad_stock?.toString() || '0',
          stock: producto.stock ?? true,
          categoria: producto.categoria || '',
          categoria_id: producto.categoria_id?.toString() || '',
          imagen: producto.imagen || '',
        });
      } else {
        // Formulario para crear nuevo producto
        setFormData({
          nombre: '',
          descripcion: '',
          precio: '',
          cantidad_stock: '0',
          stock: true,
          categoria: '',
          categoria_id: '',
          imagen: '',
        });
      }
      setFormErrors({});
      setSelectedImage(null);
    }
  }, [open, producto, isEditing]);

  // Validar formulario
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }

    if (!formData.precio || isNaN(Number(formData.precio)) || Number(formData.precio) < 0) {
      errors.precio = 'El precio debe ser un número válido mayor o igual a 0';
    }

    if (!formData.cantidad_stock || isNaN(Number(formData.cantidad_stock)) || Number(formData.cantidad_stock) < 0) {
      errors.cantidad_stock = 'La cantidad de stock debe ser un número válido mayor o igual a 0';
    }

    if (!formData.categoria_id) {
      errors.categoria_id = 'Debe seleccionar una categoría';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar cambios en los inputs
  const handleInputChange = (field: keyof FormData, value: string | boolean):void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Manejar selección de categoría
  const handleCategoriaChange = async (categoriaId: string):Promise<void> => {
    const categoria = categorias.find(cat => cat.id.toString() === categoriaId);
    setFormData(prev => ({
      ...prev,
      categoria_id: categoriaId,
      categoria: categoria?.descripcion || ''
    }));

    if (formErrors.categoria_id) {
      setFormErrors(prev => ({
        ...prev,
        categoria_id: undefined
      }));
    }
  };

  // Manejar selección de imagen
  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setAlert({ type: 'danger', message: 'Por favor selecciona un archivo de imagen válido' });
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAlert({ type: 'danger', message: 'La imagen no debe superar los 5MB' });
      return;
    }

    setSelectedImage(file);
  };

  // Manejar eliminación de imagen
  const handleRemoveImage = async (): Promise<void> => {
    if (!formData.imagen) {
      setSelectedImage(null);
      setFormData(prev => ({ ...prev, imagen: '' }));
      return;
    }

    try {
      const fileName = formData.imagen.split('/').pop();
      if (fileName) {
        await deleteImageMutation.mutateAsync(fileName);
      }
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
      setAlert({ type: 'danger', message: 'Error al eliminar la imagen. Por favor, intenta nuevamente.' });
      return;
    }

    setSelectedImage(null);
    setFormData(prev => ({ ...prev, imagen: '' }));
  };

  // Efecto para limpiar la alerta después de 3 segundos
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (alert) {
      timer = setTimeout(() => {
        setAlert(null);
      }, 3000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [alert]);

  // Manejar envío del formulario
  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setIsUploading(true);

    try {
      let imagenUrl = formData.imagen;

      // Si hay una nueva imagen seleccionada, subirla
      if (selectedImage) {
        try {
          imagenUrl = await uploadImageMutation.mutateAsync(selectedImage);
        } catch (error) {
          console.error('Error al subir la imagen:', error);
          setAlert({ type: 'danger', message: 'Error al subir la imagen. Por favor, intenta nuevamente.' });
          return;
        }
      }

      const baseProductoData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        precio: Number(formData.precio),
        cantidad_stock: Number(formData.cantidad_stock),
        stock: formData.stock,
        categoria: formData.categoria || null,
        categoria_id: Number(formData.categoria_id),
        imagen: imagenUrl || null,
        estado: 1,
      };

      if (isEditing && producto) {
        // Modo edición
        const productoUpdate: ProductoUpdate = {
          ...baseProductoData,
          id: producto.id
        };
        
        try {
          const updatedProduct = await updateProductoMutation.mutateAsync({
            id: producto.id,
            producto: productoUpdate
          });

          // Invalidar y refrescar datos
          await queryClient.invalidateQueries({ queryKey: productosKeys.all });
          await queryClient.refetchQueries({ queryKey: productosKeys.lists() });

          onSubmit(updatedProduct);
          onClose();
        } catch (error) {
          console.error('Error al actualizar producto:', error);
          setAlert({ type: 'danger', message: 'Error al actualizar el producto. Por favor, intenta nuevamente.' });
        }
      } else {
        // Modo creación
        try {
          const productoInsert: ProductoInsert = baseProductoData;
          const newProduct = await createProductoMutation.mutateAsync(productoInsert);
          
          // Invalidar y refrescar datos
          await queryClient.invalidateQueries({ queryKey: productosKeys.all });
          await queryClient.refetchQueries({ queryKey: productosKeys.lists() });

          onSubmit(newProduct);
          onClose();
        } catch (error) {
          console.error('Error al crear producto:', error);
          setAlert({ type: 'danger', message: 'Error al crear el producto. Por favor, intenta nuevamente.' });
        }
      }
    } catch (err) {
      console.error('Error en handleSubmit:', err);
      setAlert({ type: 'danger', message: err instanceof Error ? err.message : 'Error al procesar la operación' });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  // Manejar cierre del modal
  const handleClose = (): void => {
    if (isSubmitting) return; // Prevenir cierre durante envío
    
    // Limpiar estados
    setSelectedImage(null);
    setFormErrors({});
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog
        variant="outlined"
        role="alertdialog"
        aria-labelledby="producto-modal-title"
        sx={{ 
          width: { xs: '90vw', sm: 600 }, 
          maxHeight: '90vh',
          overflow: 'auto'
        }}
      >
        <ModalClose disabled={isSubmitting} />
        
        <Typography 
          id="producto-modal-title" 
          level="h2" 
          sx={{ mb: 2 }}
        >
          {isEditing ? 'Editar Producto' : 'Crear Nuevo Producto'}
        </Typography>

        {error && (
          <Alert color="danger" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {alert && (
          <Alert color={alert.type} variant="soft" sx={{ mb: 2 }}>
            {alert.message}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {/* Información básica */}
            <Card variant="soft">
              <CardContent>
                <Typography level="title-sm" sx={{ mb: 2 }}>
                  Información Básica
                </Typography>
                
                <Stack spacing={2}>
                  <FormControl error={Boolean(formErrors.nombre)}>
                    <FormLabel>Nombre del Producto *</FormLabel>
                    <Input
                      value={formData.nombre}
                      onChange={(e) => handleInputChange('nombre', e.target.value)}
                      placeholder="Ingrese el nombre del producto"
                      disabled={isSubmitting}
                    />
                    {formErrors.nombre && (
                      <FormHelperText>{formErrors.nombre}</FormHelperText>
                    )}
                  </FormControl>

                  <FormControl>
                    <FormLabel>Descripción</FormLabel>
                    <Textarea
                      value={formData.descripcion}
                      onChange={(e) => handleInputChange('descripcion', e.target.value)}
                      placeholder="Descripción del producto (opcional)"
                      minRows={3}
                      maxRows={5}
                      disabled={isSubmitting}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Imagen del Producto</FormLabel>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Button
                        component="label"
                        variant="outlined"
                        startDecorator={<Upload />}
                        disabled={isSubmitting || isUploading}
                      >
                        {selectedImage ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleImageSelect}
                        />
                      </Button>
                      {(selectedImage || formData.imagen) && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                            {selectedImage ? selectedImage.name : 'Imagen actual'}
                          </Typography>
                          <Button
                            variant="plain"
                            color="danger"
                            onClick={handleRemoveImage}
                            disabled={isSubmitting || isUploading}
                          >
                            <X />
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </FormControl>
                </Stack>
              </CardContent>
            </Card>

            {/* Precios y Stock */}
            <Card variant="soft">
              <CardContent>
                <Typography level="title-sm" sx={{ mb: 2 }}>
                  Precio y Stock
                </Typography>
                
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl sx={{ flex: 1 }} error={Boolean(formErrors.precio)}>
                      <FormLabel>Precio *</FormLabel>
                      <Input
                        type="number"
                        value={formData.precio}
                        onChange={(e) => handleInputChange('precio', e.target.value)}
                        placeholder="0.00"
                        startDecorator="$"
                        slotProps={{
                          input: {
                            min: 0,
                            step: 0.01
                          }
                        }}
                        disabled={isSubmitting}
                      />
                      {formErrors.precio && (
                        <FormHelperText>{formErrors.precio}</FormHelperText>
                      )}
                    </FormControl>

                    <FormControl sx={{ flex: 1 }} error={Boolean(formErrors.cantidad_stock)}>
                      <FormLabel>Cantidad en Stock *</FormLabel>
                      <Input
                        type="number"
                        value={formData.cantidad_stock}
                        onChange={(e) => handleInputChange('cantidad_stock', e.target.value)}
                        placeholder="0"
                        slotProps={{
                          input: {
                            min: 0
                          }
                        }}
                        disabled={isSubmitting}
                      />
                      {formErrors.cantidad_stock && (
                        <FormHelperText>{formErrors.cantidad_stock}</FormHelperText>
                      )}
                    </FormControl>
                  </Box>

                  <FormControl orientation="horizontal" sx={{ justifyContent: 'space-between' }}>
                    <div>
                      <FormLabel>Producto Disponible</FormLabel>
                    </div>
                    <Switch
                      checked={formData.stock}
                      onChange={(e) => handleInputChange('stock', e.target.checked)}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                </Stack>
              </CardContent>
            </Card>

            {/* Categoría */}
            <Card variant="soft">
              <CardContent>
                <Typography level="title-sm" sx={{ mb: 2 }}>
                  Categorización
                </Typography>
                
                <FormControl error={Boolean(formErrors.categoria_id)}>
                  <FormLabel>Categoría *</FormLabel>
                  <Select
                    value={formData.categoria_id}
                    onChange={(_, value) => handleCategoriaChange(value as string)}
                    placeholder="Seleccionar categoría"
                    disabled={isSubmitting}
                  >
                    {categorias.map((categoria) => (
                      <Option key={categoria.id} value={categoria.id.toString()}>
                        {categoria.descripcion}
                      </Option>
                    ))}
                  </Select>
                  {formErrors.categoria_id && (
                    <FormHelperText>{formErrors.categoria_id}</FormHelperText>
                  )}
                </FormControl>
              </CardContent>
            </Card>

            <Divider />

            {/* Botones de acción */}
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="plain"
                color="neutral"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={isSubmitting || loading}
                loadingIndicator={<CircularProgress size="sm" />}
                disabled={isSubmitting || loading}
              >
                {isEditing ? 'Actualizar' : 'Crear'} Producto
              </Button>
            </Box>
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
  );
}