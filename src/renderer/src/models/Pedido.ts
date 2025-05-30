/* eslint-disable prettier/prettier */
export class Producto {
    public readonly id: number;
    public nombre: string;
    public descripcion: string;
    public precio: number;
    public imagen: string;
    public categoria: string;
    public stock: boolean;
    public categoria_id: number;
    public cantidad_stock: number;
    public readonly empresa_id: number;
    public estado: number;


    constructor(
        id: number,
        nombre: string,
        descripcion: string,
        precio: number,
        imagen: string,
        categoria: string,
        stock: boolean,
        categoria_id: number,
        cantidad_stock: number,
        empresa_id: number,
        estado: number
    ) {
        if (precio < 0) throw new Error("El precio no puede ser negativo.");
        if (cantidad_stock < 0) throw new Error("El stock no puede ser negativo");

        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.imagen = imagen;
        this.categoria = categoria;
        this.stock = stock;
        this.categoria_id = categoria_id;
        this.cantidad_stock = cantidad_stock;
        this.empresa_id = empresa_id;
        this.estado = estado;
    }

    cambiarNombre(arg: string): void {
        if (arg === '') {
            throw new Error("El nombre no puede estar vacio")
        }
        this.nombre = arg;
    }

    incrementarStock(cantidad: number): void {
        if (cantidad < 0) {
            throw new Error("La cantidad no puede ser negativa");
        }

        this.cantidad_stock += cantidad;
    }

    decreaseStock(cantidad: number): void {
        if (cantidad <= 0) throw new Error("El decremento debe ser mayor a 0");
        if (cantidad > this.cantidad_stock) throw new Error("Stock insuficiente");
        this.cantidad_stock -= cantidad;
    }

}