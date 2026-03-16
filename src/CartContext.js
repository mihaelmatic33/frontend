import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getCartItemImage,
  getStoredCart,
  normalizeProductForCart,
  resolveCartItemImageUrl,
  resolveProductImageUrl,
  setStoredCart,
} from "./utils/cartItem";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => getStoredCart());

  const addToCart = (product) => {
    const normalizedItem = normalizeProductForCart(product);

    if (!normalizedItem?.id) {
      return false;
    }

    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === normalizedItem.id);
      let nextCart = [];

      if (existingItem) {
        nextCart = prev.map((item) =>
          item.id === normalizedItem.id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item,
        );
      } else {
        nextCart = [...prev, normalizedItem];
      }

      setStoredCart(nextCart);

      return nextCart;
    });

    if (!normalizedItem.image) {
      resolveProductImageUrl(product)
        .then((resolvedImage) => {
          if (!resolvedImage) return;

          setCartItems((prev) => {
            const nextCart = prev.map((item) =>
              item.id === normalizedItem.id
                ? {
                    ...item,
                    image: item.image || resolvedImage,
                    images:
                      Array.isArray(item.images) && item.images.length > 0
                        ? item.images
                        : [resolvedImage],
                  }
                : item,
            );

            setStoredCart(nextCart);
            return nextCart;
          });
        })
        .catch((error) => {
          console.error("Failed to resolve cart image:", error);
        });
    }

    return true;
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => {
      const nextCart = prev.filter((item) => item.id !== productId);
      setStoredCart(nextCart);
      return nextCart;
    });
  };

  const updateQuantity = (productId, quantity) => {
    setCartItems((prev) => {
      if (quantity <= 0) {
        const nextCart = prev.filter((item) => item.id !== productId);
        setStoredCart(nextCart);
        return nextCart;
      }

      const nextCart = prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item,
      );
      setStoredCart(nextCart);
      return nextCart;
    });
  };

  const clearCart = () => {
    setStoredCart([]);
    setCartItems([]);
  };

  useEffect(() => {
    let cancelled = false;

    const hydrateMissingImages = async () => {
      const missingImageItems = cartItems.filter(
        (item) => !getCartItemImage(item),
      );

      if (missingImageItems.length === 0) return;

      const resolved = await Promise.all(
        missingImageItems.map(async (item) => ({
          id: item.id,
          url: await resolveCartItemImageUrl(item),
        })),
      );

      if (cancelled) return;

      const urlById = new Map(
        resolved
          .filter((entry) => entry.url)
          .map((entry) => [entry.id, entry.url]),
      );

      if (urlById.size === 0) return;

      setCartItems((prev) => {
        let changed = false;

        const nextCart = prev.map((item) => {
          const resolvedUrl = urlById.get(item.id);
          if (!resolvedUrl || getCartItemImage(item)) return item;

          changed = true;
          return {
            ...item,
            image: resolvedUrl,
            images:
              Array.isArray(item.images) && item.images.length > 0
                ? item.images
                : [resolvedUrl],
          };
        });

        if (changed) {
          setStoredCart(nextCart);
        }

        return changed ? nextCart : prev;
      });
    };

    hydrateMissingImages();

    return () => {
      cancelled = true;
    };
  }, [cartItems]);

  const value = useMemo(
    () => ({ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }),
    [cartItems],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart mora biti koristen unutar CartProvider");
  }
  return context;
};
