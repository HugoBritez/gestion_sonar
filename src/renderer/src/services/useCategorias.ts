/* eslint-disable prettier/prettier */
import { useEffect, useState } from "react";
import { categoriasRepository } from "../repos/CategoriasRepo";

export const useCategorias = (): {
  categorias: { id: number; descripcion: string }[];
  loading: boolean;
  error: string | null;
} => {
  const [categorias, setCategorias] = useState<{ id: number; descripcion: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    categoriasRepository.getCategorias()
      .then(data => setCategorias(data))
      .catch(() => setError("Error al cargar las categorías"))
      .finally(() => setLoading(false));
  }, []);

  return { categorias, loading, error };
};