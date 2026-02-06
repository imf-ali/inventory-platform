import {
  useState,
  useEffect,
  useRef,
  useCallback,
  ChangeEvent,
} from 'react';
import { useNavigate } from 'react-router';
import { inventoryApi, cartApi, customersApi } from '@inventory-platform/api';
import type {
  InventoryItem,
  CartResponse,
  CheckoutItemResponse,
} from '@inventory-platform/types';
import styles from './dashboard.scan-sell.module.css';
import { useNotify } from '@inventory-platform/store';

export function meta() {
  return [
    { title: 'Scan and Sell - StockKart' },
    { name: 'description', content: 'Speed up sales with barcode scanning' },
  ];
}

interface CartItem {
  inventoryItem: InventoryItem;
  quantity: number;
  price: number;
}

function CartQuantityInput({
  value,
  onCommit,
  disabled,
}: {
  value: number;
  onCommit: (newQty: number) => Promise<void>;
  disabled: boolean;
}) {
  const [draft, setDraft] = useState(value.toString());

  useEffect(() => {
    setDraft(value.toString());
  }, [value]);

  const commit = async () => {
    const qty = Number(draft);

    if (!qty || qty <= 0 || qty === value) {
      setDraft(value.toString());
      return;
    }

    try {
      await onCommit(qty);
    } catch {
      setDraft(value.toString());
    }
  };

  return (
    <input
      type="number"
      className={styles.qtyInput}
      value={draft}
      min={1}
      disabled={disabled}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          commit();
          e.currentTarget.blur();
        }
      }}
      onFocus={(e) => e.currentTarget.select()}
    />
  );
}

function CartAdditionalDiscountInput({
  id,
  value,
  onCommit,
  disabled,
}: {
  id?: string;
  value: number | null;
  onCommit: (value: number | null) => void;
  disabled: boolean;
}) {
  const [draft, setDraft] = useState(
    value !== null && value !== undefined ? value.toString() : ''
  );

  useEffect(() => {
    const next =
      value !== null && value !== undefined ? value.toString() : '';
    setDraft(next);
  }, [value]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed === '') {
      onCommit(null);
      return;
    }
    const num = parseFloat(trimmed);
    if (isNaN(num) || num < 0 || num > 100) {
      setDraft(value !== null && value !== undefined ? value.toString() : '');
      return;
    }
    onCommit(num);
  };

  return (
    <input
      id={id}
      type="number"
      className={styles.itemAdditionalInput}
      value={draft}
      placeholder="0"
      min={0}
      max={100}
      step={0.01}
      disabled={disabled}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          commit();
          e.currentTarget.blur();
        }
      }}
    />
  );
}

export default function ScanSellPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [_searchPage, setSearchPage] = useState(0);
  const [searchPageSize, setSearchPageSize] = useState(10);
  const [_searchTotalPages, setSearchTotalPages] = useState(0);
  const [_searchTotalItems, setSearchTotalItems] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartData, setCartData] = useState<CartResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [isUpdatingCart, setIsUpdatingCart] = useState(false);
  const cartLoadedRef = useRef(false);
  const isUpdatingRef = useRef(false);
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isRetailer, setIsRetailer] = useState(false);
  const [customerGstin, setCustomerGstin] = useState('');
  const [customerDlNo, setCustomerDlNo] = useState('');
  const [customerPan, setCustomerPan] = useState('');
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [customerSectionOpen, setCustomerSectionOpen] = useState(false);
  const [additionalDiscountOverrides, setAdditionalDiscountOverrides] = useState<
    Record<string, number | null>
  >({});
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const { error: notifyError } = useNotify;

  // Product search for dropdown (only on Enter or Search button)
  const runSearch = useCallback(
    async (query: string, pageNum = 0, pageSize = 8) => {
      if (!query.trim()) {
        setSearchResults([]);
        setSearchPage(0);
        setSearchTotalPages(0);
        setSearchTotalItems(0);
        return;
      }
      setSearchPage(pageNum);
      if (pageSize !== searchPageSize) setSearchPageSize(pageSize);
      setIsSearching(true);
      setError(null);
      try {
        const response = await inventoryApi.search(query.trim(), pageNum, pageSize);
        let items: InventoryItem[] = [];
        if (response) {
          if (Array.isArray(response)) items = response;
          else if (response.data) {
            if (Array.isArray(response.data)) items = response.data;
            else if (
              response.data &&
              typeof response.data === 'object' &&
              'data' in response.data
            ) {
              const nestedData = (response.data as { data?: InventoryItem[] }).data;
              items = Array.isArray(nestedData) ? nestedData : [];
            }
          }
        }
        if (response?.page) {
          setSearchTotalPages(response.page.totalPages);
          setSearchTotalItems(response.page.totalItems);
          setSearchPage(response.page.page);
        }
        setSearchResults(items);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Search failed';
        notifyError(msg);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [searchPageSize, notifyError]
  );

  const handleSearchSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setShowSearchDropdown(false);
        return;
      }
      setShowSearchDropdown(true);
      runSearch(searchQuery, 0, 8);
    },
    [searchQuery, runSearch]
  );

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        showSearchDropdown &&
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(e.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearchDropdown]);

  // Load cart on mount (once; time guard avoids double run in React Strict Mode)
  const lastLoadCartTimeRef = useRef(0);
  useEffect(() => {
    const now = Date.now();
    if (now - lastLoadCartTimeRef.current < 1500) return;
    lastLoadCartTimeRef.current = now;
    cartLoadedRef.current = true;
    loadCart();
  }, []);

  // Auto-dismiss error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000); // 5 seconds

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [error]);

  const loadCart = async (): Promise<void> => {
    if (isUpdatingRef.current) {
      return;
    }

    setIsLoadingCart(true);
    setError(null);
    try {
      const cart = await cartApi.get();

      // Only handle CREATED and PENDING statuses
      // If status is PENDING, redirect to checkout page
      if (cart.status === 'PENDING') {
        navigate('/dashboard/checkout');
        return;
      }

      // If status is CREATED, stay on scan-sell page
      if (cart.status === 'CREATED') {
        setCartData(cart);
        setCustomerName(cart.customerName || '');
        setCustomerAddress(cart.customerAddress || '');
        setCustomerPhone(cart.customerPhone || '');
        setCustomerEmail(cart.customerEmail || '');
        // Build cart items from response only (no per-item inventory/search API calls)
        setCartItems(mergeCartResponseToItems(cart, []));
        return;
      }

      // For COMPLETED or other statuses, clear cart and stay on scan-sell
      setCartData(null);
      setCartItems([]);
      setCustomerName('');
      setCustomerAddress('');
      setCustomerPhone('');
      setCustomerEmail('');
      setIsRetailer(false);
      setCustomerGstin('');
      setCustomerDlNo('');
      setCustomerPan('');
    } catch (err) {
      // 404 or other error - no cart exists, stay on scan-sell page
      console.log('No existing cart or error loading cart:', err);
      setCartData(null);
      setCartItems([]);
      // Reset customer fields if cart is empty
      setCustomerName('');
      setCustomerAddress('');
      setCustomerPhone('');
      setCustomerEmail('');
      setIsRetailer(false);
      setCustomerGstin('');
      setCustomerDlNo('');
      setCustomerPan('');
    } finally {
      setIsLoadingCart(false);
    }
  };

  /** Build CartItem[] from cart response, reusing existing inventoryItem when possible (no API calls). */
  const mergeCartResponseToItems = useCallback(
    (cart: CartResponse, previousItems: CartItem[]): CartItem[] => {
      return cart.items.map((resItem: CheckoutItemResponse) => {
        const existing = previousItems.find(
          (i) => i.inventoryItem.id === resItem.inventoryId
        );
        const inventoryItem: InventoryItem = existing
          ? { ...existing.inventoryItem, additionalDiscount: resItem.additionalDiscount ?? existing.inventoryItem.additionalDiscount }
          : {
              id: resItem.inventoryId,
              lotId: '',
              barcode: null,
              name: resItem.name,
              description: null,
              companyName: null,
              maximumRetailPrice: resItem.maximumRetailPrice,
              costPrice: 0,
              sellingPrice: resItem.sellingPrice,
              receivedCount: 0,
              soldCount: 0,
              currentCount: 999999,
              location: '',
              expiryDate: '',
              shopId: cart.shopId,
              additionalDiscount: resItem.additionalDiscount ?? null,
            };
        return {
          inventoryItem,
          quantity: resItem.quantity,
          price: resItem.sellingPrice,
        };
      });
    },
    []
  );

  const getEffectiveAdditionalDiscount = useCallback(
    (inventoryId: string, item: CartItem) =>
      additionalDiscountOverrides[inventoryId] ??
      item.inventoryItem.additionalDiscount ??
      null,
    [additionalDiscountOverrides]
  );

  const syncCartToAPI = async (
    items: CartItem[],
    changedItemId?: string,
    quantityDelta?: number,
    originalItem?: CartItem,
    overrides?: Record<string, number | null>,
    additionalDiscountUpdate?: { inventoryId: string; additionalDiscount: number | null }
  ) => {
    // Prevent duplicate calls
    if (isUpdatingRef.current) {
      return;
    }

    const effectiveOverrides = overrides ?? additionalDiscountOverrides;
    const withAdditionalDiscount = (
      id: string,
      quantity: number,
      sellingPrice: number,
      cartItem?: CartItem
    ) => {
      const base = { id, quantity, sellingPrice };
      const addDisc =
        cartItem != null
          ? effectiveOverrides[id] ??
            cartItem.inventoryItem.additionalDiscount ??
            undefined
          : undefined;
      return addDisc !== undefined && addDisc !== null
        ? { ...base, additionalDiscount: addDisc }
        : base;
    };

    isUpdatingRef.current = true;
    setIsUpdatingCart(true);
    try {
      // If only additional discount changed, send just that item (id + additionalDiscount)
      let itemsToSend: Array<{
        id: string;
        quantity: number;
        sellingPrice: number;
        additionalDiscount?: number | null;
      }>;

      if (additionalDiscountUpdate) {
        const item = items.find(
          (i) => i.inventoryItem.id === additionalDiscountUpdate.inventoryId
        );
        if (!item) {
          isUpdatingRef.current = false;
          setIsUpdatingCart(false);
          return;
        }
        // Only id and additionalDiscount when updating discount (no quantity or sellingPrice)
        const addDisc = additionalDiscountUpdate.additionalDiscount;
        itemsToSend = [
          {
            id: item.inventoryItem.id,
            ...(addDisc !== null && addDisc !== undefined
              ? { additionalDiscount: addDisc }
              : {}),
          } as { id: string; quantity: number; sellingPrice: number; additionalDiscount?: number | null },
        ];
      } else if (changedItemId && quantityDelta !== undefined) {
        // Only send the changed item with the delta quantity (1 for increment, -1 for decrement)
        const changedItem = items.find(
          (item) => item.inventoryItem.id === changedItemId
        );
        if (changedItem) {
          // Send the actual delta value (1 for +, -1 for -)
          itemsToSend = [
            withAdditionalDiscount(
              changedItem.inventoryItem.id,
              quantityDelta,
              changedItem.price,
              changedItem
            ),
          ];
        } else {
          // Item was removed from local state (quantity became 0)
          // We still need to send it to API with -1 to remove it from cart
          // Use the originalItem passed as parameter, or find it from cartData
          const itemToRemove =
            originalItem ||
            (() => {
              const cartItem = cartData?.items.find(
                (cartItem: CheckoutItemResponse) =>
                  cartItem.inventoryId === changedItemId
              );
              return cartItem
                ? {
                    inventoryItem: {
                      id: changedItemId,
                      lotId: '',
                      barcode: null,
                      name: cartItem.name,
                      description: null,
                      companyName: null,
                      maximumRetailPrice: cartItem.maximumRetailPrice,
                      costPrice: 0,
                      sellingPrice: cartItem.sellingPrice,
                      receivedCount: 0,
                      soldCount: 0,
                      currentCount: 0,
                      location: '',
                      expiryDate: '',
                      shopId: '',
                      additionalDiscount: null,
                    },
                    quantity: 0,
                    price: cartItem.sellingPrice,
                  }
                : null;
            })();

          if (itemToRemove) {
            itemsToSend = [
              withAdditionalDiscount(
                changedItemId,
                quantityDelta,
                itemToRemove.price
              ),
            ];
          } else {
            // Fallback: send all remaining items
            itemsToSend = items.map((item) =>
              withAdditionalDiscount(
                item.inventoryItem.id,
                item.quantity,
                item.price,
                item
              )
            );
          }
        }
      } else {
        // Send all items (for initial load or bulk operations)
        itemsToSend = items.map((item) =>
          withAdditionalDiscount(
            item.inventoryItem.id,
            item.quantity,
            item.price,
            item
          )
        );
      }

      const cartPayload = {
        businessType: 'pharmacy',
        items: itemsToSend,
        ...(customerName && { customerName }),
        ...(customerAddress && { customerAddress }),
        ...(customerPhone && { customerPhone }),
        ...(customerEmail && { customerEmail }),
        ...(isRetailer && customerGstin && { customerGstin }),
        ...(isRetailer && customerDlNo && { customerDlNo }),
        ...(isRetailer && customerPan && { customerPan }),
      };

      const updatedCart = await cartApi.add(cartPayload);
      setCartData(updatedCart);
      // Merge response into local state (no extra inventory/search API calls)
      setCartItems(mergeCartResponseToItems(updatedCart, items));
      setError(null);
    } catch (err) {
      // Handle API errors - might include stock validation errors
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update cart';
      notifyError(errorMessage);
      // Revert to previous cart state on error by reloading cart
      try {
        const currentCart = await cartApi.get();
        setCartData(currentCart);
        setCartItems(mergeCartResponseToItems(currentCart, items));
      } catch {
        // If reload fails, just show the error
      }
      throw err;
    } finally {
      setIsUpdatingCart(false);
      isUpdatingRef.current = false;
    }
  };

  const handleAddToCart = async (item: InventoryItem, price?: number) => {
    // Use sellingPrice as default, or override with provided price
    const finalPrice = price !== undefined ? price : item.sellingPrice;

    if (finalPrice <= 0) {
      notifyError('Please enter a valid price');
      return;
    }

    if (item.currentCount <= 0) {
      notifyError('Product is out of stock');
      return;
    }

    setCartItems((prev) => {
      const existingItem = prev.find(
        (cartItem) => cartItem.inventoryItem.id === item.id
      );

      let updatedItems: CartItem[];
      if (existingItem) {
        // Update quantity if item already in cart
        const newQuantity = existingItem.quantity + 1;
        // Validate stock only if we have accurate inventory data
        if (item.currentCount > 0 && newQuantity > item.currentCount) {
          notifyError(`Only ${item.currentCount} items available in stock`);
          return prev;
        }
        updatedItems = prev.map((cartItem) =>
          cartItem.inventoryItem.id === item.id
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        );
      } else {
        // Add new item to cart
        // Validate stock only if we have accurate inventory data
        if (item.currentCount > 0 && item.currentCount < 1) {
          notifyError('Product is out of stock');
          return prev;
        }
        updatedItems = [
          ...prev,
          { inventoryItem: item, quantity: 1, price: finalPrice },
        ];
      }

      // Sync to API - only send the changed item with quantity: 1
      syncCartToAPI(updatedItems, item.id, 1);
      return updatedItems;
    });
    setError(null);
  };

  const handleUpdateQuantity = async (id: string, delta: number) => {
    const originalItem = cartItems.find((item) => item.inventoryItem.id === id);

    if (!originalItem) return;

    const newQuantity = originalItem.quantity + delta;

    if (
      originalItem.inventoryItem.currentCount < 999999 &&
      newQuantity > originalItem.inventoryItem.currentCount
    ) {
      setError(
        `Only ${originalItem.inventoryItem.currentCount} items available in stock`
      );
      throw new Error('Stock exceeded');
    }

    await syncCartToAPI(cartItems, id, delta);

    setCartItems((prev) =>
      prev.map((item) =>
        item.inventoryItem.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => {
      // Find the item being removed to get its quantity and price
      const itemToRemove = prev.find((item) => item.inventoryItem.id === id);
      if (!itemToRemove) {
        return prev;
      }

      // Remove from local state
      const updatedItems = prev.filter((item) => item.inventoryItem.id !== id);

      // Sync to API - send the item with negative quantity (remove all)
      syncCartToAPI(updatedItems, id, -itemToRemove.quantity, itemToRemove);
      return updatedItems;
    });
  };

  const handleAdditionalDiscountChange = (inventoryId: string, value: number | null) => {
    const next = { ...additionalDiscountOverrides, [inventoryId]: value };
    setAdditionalDiscountOverrides(next);
    // Send only this item to API (id + additionalDiscount), like quantity update
    syncCartToAPI(
      cartItems,
      undefined,
      undefined,
      undefined,
      undefined,
      { inventoryId, additionalDiscount: value }
    );
  };

  const handleClearCart = async () => {
    // Get current cart items before clearing
    const currentItems = [...cartItems];

    // Clear local state
    setCartItems([]);
    setAdditionalDiscountOverrides({});
    setError(null);

    // Send all items with negative quantities to remove them from cart
    if (currentItems.length > 0) {
      setIsUpdatingCart(true);
      try {
        const itemsToSend = currentItems.map((item) => ({
          id: item.inventoryItem.id,
          quantity: -item.quantity, // Negative quantity to remove all
          sellingPrice: item.price,
        }));

        const cartPayload = {
          businessType: 'pharmacy',
          items: itemsToSend,
          ...(customerName && { customerName }),
          ...(customerAddress && { customerAddress }),
          ...(customerPhone && { customerPhone }),
          ...(customerEmail && { customerEmail }),
          ...(isRetailer && customerGstin && { customerGstin }),
          ...(isRetailer && customerDlNo && { customerDlNo }),
          ...(isRetailer && customerPan && { customerPan }),
        };

        const updatedCart = await cartApi.add(cartPayload);
        setCartData(updatedCart);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to clear cart';
        notifyError(errorMessage);
        // Reload cart on error to restore state
        try {
          await loadCart();
        } catch {
          // If reload fails, just show the error
        }
      } finally {
        setIsUpdatingCart(false);
      }
    } else {
      // If cart is already empty, just clear the data
      setCartData(null);
    }
  };

  const calculateSubtotal = () => {
    return (
      cartData?.subTotal ??
      cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
    );
  };

  const calculateSGST = () => {
    if (cartData?.sgstAmount !== undefined && cartData?.sgstAmount !== null) {
      return cartData.sgstAmount;
    }
    // Fallback: calculate 4.5% if not provided
    return calculateSubtotal() * 0.045;
  };

  const calculateCGST = () => {
    if (cartData?.cgstAmount !== undefined && cartData?.cgstAmount !== null) {
      return cartData.cgstAmount;
    }
    // Fallback: calculate 4.5% if not provided
    return calculateSubtotal() * 0.045;
  };

  const calculateTax = () => {
    if (cartData?.taxTotal !== undefined && cartData?.taxTotal !== null) {
      return cartData.taxTotal;
    }
    // Fallback: sum of SGST and CGST
    return calculateSGST() + calculateCGST();
  };

  const calculateTotal = () => {
    if (cartData?.grandTotal !== undefined && cartData?.grandTotal !== null) {
      return cartData.grandTotal;
    }
    return calculateSubtotal() + calculateTax();
  };

  const getSGSTPercentage = () => {
    const subtotal = calculateSubtotal();
    if (subtotal === 0) return '0.0';
    const sgst = calculateSGST();
    return ((sgst / subtotal) * 100).toFixed(1);
  };

  const getCGSTPercentage = () => {
    const subtotal = calculateSubtotal();
    if (subtotal === 0) return '0.0';
    const cgst = calculateCGST();
    return ((cgst / subtotal) * 100).toFixed(1);
  };

  const handleCustomerSearch = async () => {
    if (!customerPhone.trim()) {
      notifyError('Please enter a customer phone number');
      return;
    }

    setIsSearchingCustomer(true);
    setError(null);
    try {
      const customer = await customersApi.searchByPhone(customerPhone.trim());
      if (customer) {
        setCustomerName(customer.name || '');
        setCustomerEmail(customer.email || '');
        setCustomerAddress(customer.address || '');
        // Phone is already set from the search input

        // Check if retailer fields are present
        const hasRetailerFields = !!(
          customer.gstin ||
          customer.dlNo ||
          customer.pan
        );
        if (hasRetailerFields) {
          setIsRetailer(true);
          setCustomerGstin(customer.gstin || '');
          setCustomerDlNo(customer.dlNo || '');
          setCustomerPan(customer.pan || '');
        } else {
          setIsRetailer(false);
          setCustomerGstin('');
          setCustomerDlNo('');
          setCustomerPan('');
        }
      } else {
        // Customer not found - clear all fields
        setCustomerName('');
        setCustomerEmail('');
        setCustomerAddress('');
        setIsRetailer(false);
        setCustomerGstin('');
        setCustomerDlNo('');
        setCustomerPan('');
      }
    } catch (err) {
      // On error (404 or any other error), clear all fields
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to search customer';
      notifyError(errorMessage);
      setCustomerName('');
      setCustomerEmail('');
      setCustomerAddress('');
      setIsRetailer(false);
      setCustomerGstin('');
      setCustomerDlNo('');
      setCustomerPan('');
    } finally {
      setIsSearchingCustomer(false);
    }
  };

  const handleProcessPayment = async () => {
    if (cartItems.length === 0) {
      notifyError('Cart is empty');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Call upsert API with only customer info (no items)
      const upsertPayload = {
        businessType: 'pharmacy',
        items: [], // Empty items array - only updating customer info
        ...(customerName && { customerName }),
        ...(customerAddress && { customerAddress }),
        ...(customerPhone && { customerPhone: customerPhone.trim() }),
        ...(customerEmail && { customerEmail: customerEmail.trim() }),
        ...(isRetailer &&
          customerGstin && { customerGstin: customerGstin.trim() }),
        ...(isRetailer &&
          customerDlNo && { customerDlNo: customerDlNo.trim() }),
        ...(isRetailer && customerPan && { customerPan: customerPan.trim() }),
      };

      const upsertResponse = await cartApi.add(upsertPayload);

      // Get purchaseId from upsert response or cartData
      const purchaseId = upsertResponse.purchaseId || cartData?.purchaseId;

      if (!purchaseId) {
        throw new Error('Purchase ID not found');
      }

      // Step 2: Call update status API with PENDING status and CASH payment method
      const statusPayload = {
        purchaseId,
        status: 'PENDING',
        paymentMethod: 'CASH',
      };

      await cartApi.updateStatus(statusPayload);

      // Navigate to checkout page (it will load data via GET cart API)
      navigate('/dashboard/checkout');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to process payment';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.page}>
      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.header}>
        <h2 className={styles.title}>Scan and Sell</h2>
        <p className={styles.subtitle}>
          Speed up sales with barcode scanning
        </p>
      </div>

      {/* Main: cart (wider) + totals sidebar (narrow fixed) */}
      <div className={styles.mainRow}>
        <div className={styles.cartArea}>
          <div className={styles.cartSection}>
            {/* Search inside cart: API only on Enter or Search button */}
            <div className={styles.searchRow} ref={searchWrapperRef}>
              <form
                className={styles.searchForm}
                onSubmit={handleSearchSubmit}
              >
                <div className={styles.searchInputWrapper}>
                  <span
                    className={styles.searchIcon}
                    role="img"
                    aria-label="Search"
                  >
                    🔍
                  </span>
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setSearchQuery(e.currentTarget.value)
                    }
                    disabled={isSearching}
                    autoFocus
                    aria-expanded={showSearchDropdown}
                    aria-haspopup="listbox"
                    aria-controls="search-results-list"
                  />
                  <button
                    type="submit"
                    className={styles.searchSubmitBtn}
                    disabled={isSearching}
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </form>
              {showSearchDropdown && (
                <div
                  id="search-results-list"
                  className={styles.searchDropdown}
                  role="listbox"
                >
                  {isSearching ? (
                    <div className={styles.dropdownLoading}>Searching...</div>
                  ) : searchResults.length === 0 ? (
                    <div className={styles.dropdownEmpty}>No products found</div>
                  ) : (
                    <ul className={styles.dropdownList}>
                      {searchResults.map((item) => (
                        <SearchDropdownItem
                          key={item.id}
                          item={item}
                          onAddToCart={handleAddToCart}
                          disabled={item.currentCount <= 0 || isUpdatingCart}
                        />
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className={styles.cartItems}>
              {isLoadingCart ? (
                <div className={styles.loading}>Loading cart...</div>
              ) : cartItems.length === 0 ? (
                <div className={styles.emptyCart}>Cart is empty</div>
              ) : (
                cartItems.map((cartItem) => (
                  <div
                    key={cartItem.inventoryItem.id}
                    className={styles.cartItem}
                  >
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>
                        {cartItem.inventoryItem.name || 'Unnamed Product'}
                      </span>
                      {cartItem.inventoryItem.companyName && (
                        <span className={styles.itemCompany}>
                          {cartItem.inventoryItem.companyName}
                        </span>
                      )}
                      <div className={styles.itemPriceInfo}>
                        <span className={styles.itemPrice}>
                          ₹{cartItem.price.toFixed(2)} each
                        </span>
                        {cartItem.inventoryItem.maximumRetailPrice >
                          cartItem.price && (
                          <span className={styles.itemDiscount}>
                            {(
                              ((cartItem.inventoryItem.maximumRetailPrice -
                                cartItem.price) /
                                cartItem.inventoryItem.maximumRetailPrice) *
                              100
                            ).toFixed(1)}
                            % off MRP
                          </span>
                        )}
                        <div className={styles.itemAdditionalRow}>
                          <label className={styles.itemAdditionalLabel} htmlFor={`add-disc-${cartItem.inventoryItem.id}`}>
                            Additional discount
                          </label>
                          <CartAdditionalDiscountInput
                            id={`add-disc-${cartItem.inventoryItem.id}`}
                            value={
                              getEffectiveAdditionalDiscount(
                                cartItem.inventoryItem.id,
                                cartItem
                              )
                            }
                            onCommit={(num) =>
                              handleAdditionalDiscountChange(
                                cartItem.inventoryItem.id,
                                num
                              )
                            }
                            disabled={isUpdatingCart}
                          />
                          <span className={styles.itemAdditionalSuffix}>%</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.itemActions}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() =>
                          handleUpdateQuantity(cartItem.inventoryItem.id, -1)
                        }
                        disabled={isUpdatingCart}
                      >
                        -
                      </button>
                      <CartQuantityInput
                        value={cartItem.quantity}
                        disabled={isUpdatingCart}
                        onCommit={async (newQty) => {
                          const delta = newQty - cartItem.quantity;
                          if (delta !== 0) {
                            await handleUpdateQuantity(
                              cartItem.inventoryItem.id,
                              delta
                            );
                          }
                        }}
                      />
                      <button
                        className={styles.qtyBtn}
                        onClick={() =>
                          handleUpdateQuantity(cartItem.inventoryItem.id, 1)
                        }
                        disabled={isUpdatingCart}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() =>
                          handleRemoveItem(cartItem.inventoryItem.id)
                        }
                        disabled={isUpdatingCart}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Totals and actions sidebar */}
        <aside className={styles.summarySidebar}>
          <div className={styles.customerBlock}>
            <button
              type="button"
              className={styles.customerToggle}
              onClick={() => setCustomerSectionOpen((o) => !o)}
              aria-expanded={customerSectionOpen}
            >
              <span className={styles.customerToggleLabel}>Customer</span>
              {customerName || customerPhone ? (
                <span className={styles.customerToggleValue}>
                  {customerName || customerPhone}
                </span>
              ) : (
                <span className={styles.customerToggleHint}>Optional</span>
              )}
              <span className={styles.customerToggleIcon}>
                {customerSectionOpen ? '▼' : '▶'}
              </span>
            </button>
            {customerSectionOpen && (
              <div className={styles.customerForm}>
                <div className={styles.customerFieldsVertical}>
                  <div className={styles.customerField}>
                    <label htmlFor="sidebar-customerPhone" className={styles.customerLabel}>
                      Phone
                    </label>
                    <div className={styles.customerInputRow}>
                      <input
                        id="sidebar-customerPhone"
                        type="tel"
                        className={styles.customerInput}
                        placeholder="Phone"
                        value={customerPhone}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setCustomerPhone(e.currentTarget.value)
                        }
                        disabled={isSearchingCustomer}
                      />
                      <button
                        type="button"
                        className={styles.sidebarSearchBtn}
                        onClick={handleCustomerSearch}
                        disabled={isSearchingCustomer || !customerPhone.trim()}
                        title="Search customer"
                      >
                        {isSearchingCustomer ? '…' : '⌕'}
                      </button>
                    </div>
                  </div>
                  <div className={styles.customerField}>
                    <label htmlFor="sidebar-customerName" className={styles.customerLabel}>
                      Name
                    </label>
                    <input
                      id="sidebar-customerName"
                      type="text"
                      className={styles.customerInput}
                      placeholder="Name"
                      value={customerName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setCustomerName(e.currentTarget.value)
                      }
                    />
                  </div>
                  <div className={styles.customerField}>
                    <label htmlFor="sidebar-customerEmail" className={styles.customerLabel}>
                      Email
                    </label>
                    <input
                      id="sidebar-customerEmail"
                      type="email"
                      className={styles.customerInput}
                      placeholder="Email"
                      value={customerEmail}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setCustomerEmail(e.currentTarget.value)
                      }
                    />
                  </div>
                  <div className={styles.customerField}>
                    <label htmlFor="sidebar-customerAddress" className={styles.customerLabel}>
                      Address
                    </label>
                    <input
                      id="sidebar-customerAddress"
                      type="text"
                      className={styles.customerInput}
                      placeholder="Address"
                      value={customerAddress}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setCustomerAddress(e.currentTarget.value)
                      }
                    />
                  </div>
                </div>
                <div className={styles.retailerCheckboxContainer}>
                  <label className={styles.retailerCheckboxLabel}>
                    <input
                      type="checkbox"
                      checked={isRetailer}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setIsRetailer(e.currentTarget.checked);
                        if (!e.currentTarget.checked) {
                          setCustomerGstin('');
                          setCustomerDlNo('');
                          setCustomerPan('');
                        }
                      }}
                      className={styles.retailerCheckbox}
                    />
                    <span>Is Retailer</span>
                  </label>
                </div>
                {isRetailer && (
                  <div className={styles.retailerSection}>
                    <div className={styles.customerField}>
                      <label htmlFor="sidebar-customerGstin" className={styles.customerLabel}>
                        GSTIN
                      </label>
                      <input
                        id="sidebar-customerGstin"
                        type="text"
                        className={styles.customerInput}
                        placeholder="GSTIN"
                        value={customerGstin}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setCustomerGstin(e.currentTarget.value)
                        }
                      />
                    </div>
                    <div className={styles.customerField}>
                      <label htmlFor="sidebar-customerDlNo" className={styles.customerLabel}>
                        DL No
                      </label>
                      <input
                        id="sidebar-customerDlNo"
                        type="text"
                        className={styles.customerInput}
                        placeholder="DL No"
                        value={customerDlNo}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setCustomerDlNo(e.currentTarget.value)
                        }
                      />
                    </div>
                    <div className={styles.customerField}>
                      <label htmlFor="sidebar-customerPan" className={styles.customerLabel}>
                        PAN
                      </label>
                      <input
                        id="sidebar-customerPan"
                        type="text"
                        className={styles.customerInput}
                        placeholder="PAN"
                        value={customerPan}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setCustomerPan(e.currentTarget.value)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.cartSummary}>
            {isLoadingCart ? (
              <div className={styles.loading}>Loading...</div>
            ) : (
              <>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                {cartData &&
                  cartData.additionalDiscountTotal !== undefined &&
                  cartData.additionalDiscountTotal !== null &&
                  cartData.additionalDiscountTotal > 0 && (
                    <div className={styles.summaryRow}>
                      <span>Additional Discount</span>
                      <span>
                        -₹{cartData.additionalDiscountTotal.toFixed(2)}
                      </span>
                    </div>
                  )}
                <div className={styles.summaryRow}>
                  <span>SGST ({getSGSTPercentage()}%)</span>
                  <span>₹{calculateSGST().toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>CGST ({getCGSTPercentage()}%)</span>
                  <span>₹{calculateCGST().toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Total Tax</span>
                  <span>₹{calculateTax().toFixed(2)}</span>
                </div>
                <div className={styles.summaryRowTotal}>
                  <span>Total</span>
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
          <div className={styles.cartActions}>
            <button className={styles.clearBtn} onClick={handleClearCart}>
              Clear Cart
            </button>
            <button
              className={styles.checkoutBtn}
              onClick={handleProcessPayment}
              disabled={
                cartItems.length === 0 ||
                isProcessing ||
                isUpdatingCart ||
                isLoadingCart
              }
            >
              {isProcessing
                ? 'Processing...'
                : isUpdatingCart
                ? 'Updating...'
                : 'Process Payment'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

// Search dropdown item with full details (like original product result)
function SearchDropdownItem({
  item,
  onAddToCart,
  disabled,
}: {
  item: InventoryItem;
  onAddToCart: (item: InventoryItem, price?: number) => void;
  disabled: boolean;
}) {
  const [price, setPrice] = useState(item.sellingPrice.toString());

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) return;
    if (priceValue !== item.sellingPrice) {
      onAddToCart(item, priceValue);
    } else {
      onAddToCart(item);
    }
    setPrice(item.sellingPrice.toString());
  };

  return (
    <li className={styles.dropdownItem} role="option">
      <div className={styles.dropdownItemInfo}>
        <span className={styles.dropdownItemName}>
          {item.name || 'Unnamed Product'}
        </span>
        {item.companyName && (
          <span className={styles.dropdownItemCompany}>
            Company: {item.companyName}
          </span>
        )}
        {item.barcode && (
          <span className={styles.dropdownItemMeta}>
            Barcode: {item.barcode}
          </span>
        )}
        <span className={styles.dropdownItemMeta}>
          Current: {item.currentCount}
        </span>
        <span className={`${styles.dropdownItemMeta} ${styles.dropdownItemMetaBold}`}>
          MRP: ₹{item.maximumRetailPrice.toFixed(2)}
        </span>
        <span className={`${styles.dropdownItemMeta} ${styles.dropdownItemMetaBold}`}>
          PTR: ₹{item.sellingPrice.toFixed(2)}
        </span>
        {item.expiryDate && (
          <span className={`${styles.dropdownItemMeta} ${styles.dropdownItemMetaBold}`}>
            Expires: {formatDate(item.expiryDate)}
          </span>
        )}
      </div>
      <div className={styles.dropdownItemActions}>
        <div className={styles.priceInputGroup}>
          <label className={styles.priceLabel}>Price:</label>
          <input
            type="number"
            className={styles.priceInput}
            value={price}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPrice(e.currentTarget.value)
            }
            step="0.01"
            min="0"
          />
        </div>
        <button
          type="button"
          className={styles.dropdownAddBtn}
          onClick={handleAdd}
          disabled={disabled}
        >
          Add
        </button>
      </div>
    </li>
  );
}

