/* eslint-disable prettier/prettier */
import * as React from 'react';
import { ColorPaletteProp } from '@mui/joy/styles';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Link from '@mui/joy/Link';
import Input from '@mui/joy/Input';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Table from '@mui/joy/Table';
import Sheet from '@mui/joy/Sheet';
import IconButton from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Dropdown from '@mui/joy/Dropdown';

import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import BlockIcon from '@mui/icons-material/Block';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import { PlusIcon } from 'lucide-react';

import {  useProductos, useUpdateProducto } from '../../../services/useProductos';
import { useCategorias } from '@renderer/services/useCategorias';
import { Producto } from '@renderer/models/Producto';
import ProductoModal from './ProductoModal';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T): number {
  const aValue = a[orderBy];
  const bValue = b[orderBy];

  if (aValue == null && bValue == null) return 0;
  if (aValue == null) return 1;
  if (bValue == null) return -1;

  if (typeof aValue === 'number' && typeof bValue === 'number') {
    return bValue - aValue;
  }
  if (typeof aValue === 'string' && typeof bValue === 'string') {
    return bValue.localeCompare(aValue);
  }
  return String(bValue).localeCompare(String(aValue));
}

type Order = 'asc' | 'desc';

function getComparator<T>(order: Order, orderBy: keyof T): (a: T, b: T) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function RowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }): React.JSX.Element {
  return (
    <Dropdown>
      <MenuButton
        slots={{ root: IconButton }}
        slotProps={{ root: { variant: 'plain', color: 'neutral', size: 'sm' } }}
      >
        <MoreHorizRoundedIcon />
      </MenuButton>
      <Menu size="sm" sx={{ minWidth: 140 }}>
        <MenuItem onClick={onEdit}>Editar</MenuItem>
        <Divider />
        <MenuItem color="danger" onClick={onDelete}>Eliminar</MenuItem>
      </Menu>
    </Dropdown>
  );
}

export default function ProductosTable(): React.JSX.Element {
  const [order, setOrder] = React.useState<Order>('desc');
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [stockFilter, setStockFilter] = React.useState<string>('all');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState<boolean>(false);
  const [isEditingModalOpen, setIsEditingModalOpen] = React.useState<boolean>(false);
  const [selectedProducto, setSelectedProducto] = React.useState<Producto | null>(null);

  // ✅ USO CORRECTO: Patrón reactivo con filtros como parámetros
  const { 
    productos, 
    error, 
    loading 
  } = useProductos({
    nombre: searchTerm || undefined,
    categoria: categoryFilter !== 'all' ? Number(categoryFilter) : undefined,
    pageParam: 1
  });

  const { categorias } = useCategorias();
  const updateProductoMutation = useUpdateProducto();

  // Función para obtener el estado del stock
  const getStockStatus = (cantidadStock: number | null, tieneStock: boolean | null): string => {
    if (!tieneStock || cantidadStock === 0) return 'sin-stock';
    if (cantidadStock && cantidadStock <= 5) return 'poco-stock';
    return 'con-stock';
  };



  // ✅ Filtrar productos localmente (solo el filtro de stock que no viene del servidor)
  const filteredProductos = React.useMemo(() => {
    let filtered = productos;

    // Solo filtro por stock (los demás filtros ya vienen aplicados del hook)
    if (stockFilter !== 'all') {
      filtered = filtered.filter(producto => {
        const stockStatus = getStockStatus(producto.cantidad_stock, producto.stock);
        if (stockFilter === 'stock') return stockStatus === 'con-stock';
        if (stockFilter === 'sinstock') return stockStatus === 'sin-stock';
        if (stockFilter === 'pocostock') return stockStatus === 'poco-stock';
        return true;
      });
    }

    return filtered;
  }, [productos, stockFilter]); // ✅ searchTerm y categoryFilter ya no son necesarios aquí

  const handleEdit = (producto: Producto): void => {
    console.log('Editar producto:', producto);
    setSelectedProducto(producto);
    setIsEditingModalOpen(true);
  };

  const handleDelete = async (producto: Producto): Promise<void> => {
    console.log('Eliminar producto:', producto);
    try {
      await updateProductoMutation.mutateAsync({
        id: producto.id,
        producto: { estado: 0 }
      });
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  };

  const handleCreateSuccess = (): void => {
    setIsCreateModalOpen(false);
    setSelectedProducto(null);
  };

  const handleUpdateSuccess = (): void => {
    
    setIsEditingModalOpen(false);
    setSelectedProducto(null);
  };

  const renderFilters = (): React.JSX.Element => (
    <React.Fragment>
      <FormControl size="sm">
        <FormLabel>Stock</FormLabel>
        <Select
          size="sm"
          placeholder="Filtrar por stock"
          value={stockFilter}
          onChange={(_, value) => setStockFilter(value as string)}
          slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
        >
          <Option value="all">Todos</Option>
          <Option value="stock">Con stock</Option>
          <Option value="pocostock">Poco stock</Option>
          <Option value="sinstock">Sin stock</Option>
        </Select>
      </FormControl>
      <FormControl size="sm">
        <FormLabel>Categorías</FormLabel>
        <Select
          size="sm"
          placeholder="Todas"
          value={categoryFilter}
          onChange={(_, value) => setCategoryFilter(value as string)}
        >
          <Option value="all">Todas</Option>
          {categorias?.map(categoria => (
            <Option key={categoria.id} value={categoria.id.toString()}>
              {categoria.descripcion}
            </Option>
          ))}
        </Select>
      </FormControl>
      <Button
        color="primary"
        startDecorator={<PlusIcon />}
        size="sm"
        onClick={() => setIsCreateModalOpen(true)}
      >
        Crear Nuevo 
      </Button>
    </React.Fragment>
  );

  if (loading) {
    return <Typography>Cargando productos...</Typography>;
  }

  if (error) {
    return <Typography color="danger">Error: {error}</Typography>;
  }

  return (
    <React.Fragment>
      <Sheet
        className="SearchAndFilters-mobile"
        sx={{ display: { xs: 'flex', sm: 'none' }, my: 1, gap: 1 }}
      >
        <Input
          size="sm"
          placeholder="Buscar productos..."
          startDecorator={<SearchIcon />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <IconButton
          size="sm"
          variant="outlined"
          color="neutral"
          onClick={() => setOpen(true)}
        >
          <FilterAltIcon />
        </IconButton>
        
        <Modal open={open} onClose={() => setOpen(false)}>
          <ModalDialog aria-labelledby="filter-modal" layout="fullscreen">
            <ModalClose />
            <Typography id="filter-modal" level="h2">
              Filtros
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Sheet sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {renderFilters()}
              <Button color="primary" onClick={() => setOpen(false)}>
                Aplicar
              </Button>
            </Sheet>
          </ModalDialog>
        </Modal>
      </Sheet>

      <Box
        className="SearchAndFilters-tabletUp"
        sx={{
          borderRadius: 'sm',
          py: 2,
          display: { xs: 'none', sm: 'flex' },
          flexWrap: 'wrap',
          gap: 1.5,
          '& > *': {
            minWidth: { xs: '120px', md: '160px' },
          },
        }}
      >
        <FormControl sx={{ flex: 1 }} size="sm">
          <FormLabel>Buscar Producto</FormLabel>
          <Input
            size="sm"
            placeholder="Buscar por nombre o ID..."
            startDecorator={<SearchIcon />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </FormControl>
        {renderFilters()}
      </Box>

      <Sheet
        className="OrderTableContainer"
        variant="outlined"
        sx={{
          display: { xs: 'none', sm: 'initial' },
          width: '100%',
          borderRadius: 'sm',
          flexShrink: 1,
          overflow: 'auto',
          minHeight: 0,
        }}
      >
        <Table
          aria-labelledby="tableTitle"
          stickyHeader
          hoverRow
          sx={{
            '--TableCell-headBackground': 'var(--joy-palette-background-level1)',
            '--Table-headerUnderlineThickness': '1px',
            '--TableRow-hoverBackground': 'var(--joy-palette-background-level1)',
            '--TableCell-paddingY': '4px',
            '--TableCell-paddingX': '8px',
          }}
        >
          <thead>
            <tr>
              <th style={{ width: 120, padding: '12px 6px' }}>
                <Link
                  underline="none"
                  color="primary"
                  component="button"
                  onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
                  endDecorator={<ArrowDropDownIcon />}
                  sx={[
                    {
                      fontWeight: 'lg',
                      '& svg': {
                        transition: '0.2s',
                        transform:
                          order === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)',
                      },
                    },
                    order === 'desc'
                      ? { '& svg': { transform: 'rotate(0deg)' } }
                      : { '& svg': { transform: 'rotate(180deg)' } },
                  ]}
                >
                  Código/ID
                </Link>
              </th>
              <th style={{ width: 200, padding: '12px 6px' }}>Nombre</th>
              <th style={{ width: 100, padding: '12px 6px' }}>Stock</th>
              <th style={{ width: 120, padding: '12px 6px' }}>Precio</th>
              <th style={{ width: 140, padding: '12px 6px' }}>Categoría</th>
              <th style={{ width: 80, padding: '12px 6px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {[...filteredProductos]
              .sort(getComparator(order, 'id' as keyof Producto))
              .map((producto) => (
                <tr key={producto.id} onClick={() => setSelectedProducto(producto)}>
                  <td>
                    <Typography level="body-xs">{producto.id}</Typography>
                  </td>
                  <td>
                    <Typography level="body-xs" sx={{ fontWeight: 'md' }}>
                      {producto.nombre}
                    </Typography>
                    {producto.descripcion && (
                      <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                        {producto.descripcion.length > 50
                          ? `${producto.descripcion.substring(0, 50)}...`
                          : producto.descripcion}
                      </Typography>
                    )}
                  </td>
                  <td>
                    <Chip
                      variant="soft"
                      size="sm"
                      startDecorator={
                        {
                          'con-stock': <CheckRoundedIcon />,
                          'poco-stock': <WarningRoundedIcon />,
                          'sin-stock': <BlockIcon />,
                        }[getStockStatus(producto.cantidad_stock, producto.stock)]
                      }
                      color={
                        {
                          'con-stock': 'success',
                          'poco-stock': 'warning',
                          'sin-stock': 'danger',
                        }[getStockStatus(producto.cantidad_stock, producto.stock)] as ColorPaletteProp
                      }
                    >
                      {producto.cantidad_stock || 0}
                    </Chip>
                  </td>
                  <td>
                    <Typography level="body-xs">
                      ${producto.precio ? producto.precio.toFixed(0) : '0'}
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-xs">
                      {producto.categoria || 'Sin categoría'}
                    </Typography>
                  </td>
                  <td>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <RowMenu
                        onEdit={() => handleEdit(producto)}
                        onDelete={() => handleDelete(producto)}
                      />
                    </Box>
                  </td>
                </tr>
              ))}
            {filteredProductos.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                  <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                    No se encontraron productos
                  </Typography>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Sheet>

      <ProductoModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSuccess}
        categorias={categorias}
        loading={updateProductoMutation.isPending}
        error={updateProductoMutation.error?.message}
      />

      <ProductoModal
        open={isEditingModalOpen}
        onClose={() => setIsEditingModalOpen(false)}
        onSubmit={handleUpdateSuccess}
        producto={selectedProducto}
        categorias={categorias}
        loading={updateProductoMutation.isPending}
        error={updateProductoMutation.error?.message}
      />
    </React.Fragment>
  );
}