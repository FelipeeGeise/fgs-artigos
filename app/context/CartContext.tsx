"use client";

import {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
  useContext,
} from "react";

// ✅ ADICIONADO 'email' para compatibilidade com o Banco de Dados e Dropshipping
export interface CustomerData {
  nome: string;
  cpf: string;
  whatsapp: string;
  email: string; // Campo obrigatório para rastreio e notas
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export type Product = {
  id: string | number;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  quantity?: number;
};

export type Order = {
  id: string;
  date: string;
  items: Product[];
  total: number;
  status: string;
  customerData: CustomerData;
};

type CartContextType = {
  cart: Product[];
  favorites: Product[];
  orders: Order[];
  total: number;
  isLoaded: boolean;
  addToCart: (product: Product) => void;
  removeFromCart: (id: string | number) => void;
  clearCart: () => void;
  increaseQuantity: (id: string | number) => void;
  decreaseQuantity: (id: string | number) => void;
  toggleFavorite: (product: Product) => void;
  isFavorite: (id: string | number) => boolean;
  finalizeOrder: (customerData: CustomerData, orderId?: string) => void; // ✅ Adicionado orderId opcional
};

export const CartContext = createContext<CartContextType | null>(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return context;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. CARREGAR DADOS DO LOCALSTORAGE (Ao montar o componente)
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("cart");
      const storedFavs = localStorage.getItem("favorites");
      const storedOrders = localStorage.getItem("orders");
      
      if (storedCart) setCart(JSON.parse(storedCart));
      if (storedFavs) setFavorites(JSON.parse(storedFavs));
      if (storedOrders) setOrders(JSON.parse(storedOrders));
    } catch (error) {
      console.error("Erro ao carregar persistência:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 2. SALVAR DADOS NO LOCALSTORAGE (Sempre que houver mudanças)
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("favorites", JSON.stringify(favorites));
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [cart, favorites, orders, isLoaded]);

  // 3. CÁLCULO DO TOTAL
  const total = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
  }, [cart]);

  // --- FUNÇÕES DO CARRINHO ---

  function addToCart(product: Product) {
    if (!product || !product.id) return;
    setCart((prev) => {
      const exists = prev.find((item) => String(item.id) === String(product.id));
      if (exists) {
        return prev.map((item) =>
          String(item.id) === String(product.id) 
            ? { ...item, quantity: (item.quantity || 1) + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }

  function removeFromCart(id: string | number) {
    setCart((prev) => prev.filter((item) => String(item.id) !== String(id)));
  }

  function clearCart() { setCart([]); }

  function increaseQuantity(id: string | number) {
    setCart((prev) =>
      prev.map((item) =>
        String(item.id) === String(id) 
          ? { ...item, quantity: (item.quantity || 1) + 1 } 
          : item
      )
    );
  }

  function decreaseQuantity(id: string | number) {
    setCart((prev) =>
      prev
        .map((item) =>
          String(item.id) === String(id) 
            ? { ...item, quantity: (item.quantity || 1) - 1 } 
            : item
        )
        .filter((item) => (item.quantity || 0) > 0)
    );
  }

  // --- FUNÇÕES DE FAVORITOS ---

  function toggleFavorite(product: Product) {
    setFavorites((prev) => {
      const exists = prev.find((item) => String(item.id) === String(product.id));
      if (exists) {
        return prev.filter((item) => String(item.id) !== String(product.id));
      }
      return [...prev, product];
    });
  }

  function isFavorite(id: string | number) {
    return favorites.some((item) => String(item.id) === String(id));
  }

  // --- FINALIZAR PEDIDO (Sincroniza com a Action do Banco) ---
  // Aceita o orderId opcional que vem do Prisma para manter os IDs iguais
  function finalizeOrder(customerData: CustomerData, orderIdFromDB?: string) {
    const newOrder: Order = {
      id: orderIdFromDB || Math.floor(1000 + Math.random() * 9000).toString(),
      date: new Date().toLocaleDateString("pt-BR"),
      items: [...cart],
      total: total,
      status: "Aguardando PIX",
      customerData: customerData,
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
  }

  return (
    <CartContext.Provider
      value={{ 
        cart, 
        favorites, 
        orders,
        total, 
        isLoaded,
        addToCart, 
        removeFromCart, 
        clearCart, 
        increaseQuantity, 
        decreaseQuantity,
        toggleFavorite,
        isFavorite,
        finalizeOrder
      }}
    >
      {children}
    </CartContext.Provider>
  );
}