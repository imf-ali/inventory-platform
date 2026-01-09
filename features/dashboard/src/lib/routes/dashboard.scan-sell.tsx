import { useState, FormEvent, useEffect, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router';
import { inventoryApi, cartApi, customersApi } from '@inventory-platform/api';
import type {
  InventoryItem,
  CartResponse,
  CheckoutItemResponse,
} from '@inventory-platform/types';
import styles from './dashboard.scan-sell.module.css';

export function meta() {
  return [
    { title: 'Scan and Sell - StockKart' },
    { name: 'description', content: 'Speed up sales with barcode scanning' },
  ];
}

interface CartItem {
  inventoryItem: InventoryItem;
  quantity: number;
  price: number; // Selling price per unit
}

export default function ScanSellPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPage, setSearchPage] = useState(0);
  const [searchPageSize, setSearchPageSize] = useState(10);
  const [searchTotalPages, setSearchTotalPages] = useState(0);
  const [searchTotalItems, setSearchTotalItems] = useState(0);
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

  // Load cart on mount (only once, even in StrictMode)
  useEffect(() => {
    if (!cartLoadedRef.current) {
      cartLoadedRef.current = true;
      loadCart();
    }
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
    // Prevent duplicate calls
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
        // Load customer fields from cart
        setCustomerName(cart.customerName || '');
        setCustomerAddress(cart.customerAddress || '');
        setCustomerPhone(cart.customerPhone || '');
        setCustomerEmail(cart.customerEmail || '');
        // Convert cart items to local format
        await convertCartToLocalItems(cart);
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

  const convertCartToLocalItems = async (cart: CartResponse) => {
    try {
      // Create minimal inventory items from cart data
      // We'll try to fetch full details, but use cart data as fallback
      const localItems: CartItem[] = [];

      for (const cartItem of cart.items) {
        // Try to fetch full inventory details to get accurate stock count
        let inventoryItem: InventoryItem | null = null;
        try {
          const searchResult = await inventoryApi.search(cartItem.inventoryId);
          inventoryItem =
            searchResult.data?.find((inv) => inv.id === cartItem.inventoryId) ||
            null;
        } catch {
          // If search fails, we'll create a minimal item
        }

        if (inventoryItem) {
          // Use the actual inventory item with correct stock count
          localItems.push({
            inventoryItem,
            quantity: cartItem.quantity,
            price: cartItem.sellingPrice,
          });
        } else {
          // Create minimal inventory item from cart data
          // Note: We don't know the actual stock, so we'll set a high value to avoid false errors
          // The API will handle stock validation
          const minimalItem: InventoryItem = {
            id: cartItem.inventoryId,
            lotId: '', // Will be populated when we fetch full details
            barcode: null,
            name: cartItem.name,
            description: null,
            companyName: null,
            maximumRetailPrice: cartItem.maximumRetailPrice,
            costPrice: 0,
            sellingPrice: cartItem.sellingPrice,
            receivedCount: 0,
            soldCount: 0,
            currentCount: 999999, // Set high to avoid false stock errors - API will validate
            location: '',
            expiryDate: '',
            shopId: cart.shopId,
          };
          localItems.push({
            inventoryItem: minimalItem,
            quantity: cartItem.quantity,
            price: cartItem.sellingPrice,
          });
        }
      }
      setCartItems(localItems);
    } catch (err) {
      console.error('Error converting cart items:', err);
    }
  };

  const syncCartToAPI = async (
    items: CartItem[],
    changedItemId?: string,
    quantityDelta?: number,
    originalItem?: CartItem
  ) => {
    // Prevent duplicate calls
    if (isUpdatingRef.current) {
      return;
    }

    isUpdatingRef.current = true;
    setIsUpdatingCart(true);
    try {
      // If a specific item changed, only send that item with quantity: 1 (the increment)
      // Otherwise, send all items (for initial load or bulk updates)
      let itemsToSend: Array<{
        id: string;
        quantity: number;
        sellingPrice: number;
      }>;

      if (changedItemId && quantityDelta !== undefined) {
        // Only send the changed item with the delta quantity (1 for increment, -1 for decrement)
        const changedItem = items.find(
          (item) => item.inventoryItem.id === changedItemId
        );
        if (changedItem) {
          // Send the actual delta value (1 for +, -1 for -)
          itemsToSend = [
            {
              id: changedItem.inventoryItem.id,
              quantity: quantityDelta, // Send the actual delta: 1 for increment, -1 for decrement
              sellingPrice: changedItem.price,
            },
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
                    },
                    quantity: 0,
                    price: cartItem.sellingPrice,
                  }
                : null;
            })();

          if (itemToRemove) {
            itemsToSend = [
              {
                id: changedItemId,
                quantity: quantityDelta, // Send -1 to remove the item
                sellingPrice: itemToRemove.price,
              },
            ];
          } else {
            // Fallback: send all remaining items
            itemsToSend = items.map((item) => ({
              id: item.inventoryItem.id,
              quantity: item.quantity,
              sellingPrice: item.price,
            }));
          }
        }
      } else {
        // Send all items (for initial load or bulk operations)
        itemsToSend = items.map((item) => ({
          id: item.inventoryItem.id,
          quantity: item.quantity,
          sellingPrice: item.price,
        }));
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
      // Update local items with latest data from API
      await convertCartToLocalItems(updatedCart);
      // Clear any previous errors on successful update
      setError(null);
    } catch (err) {
      // Handle API errors - might include stock validation errors
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update cart';
      setError(errorMessage);
      // Revert to previous cart state on error by reloading cart
      try {
        const currentCart = await cartApi.get();
        await convertCartToLocalItems(currentCart);
        setCartData(currentCart);
      } catch {
        // If reload fails, just show the error
      }
    } finally {
      setIsUpdatingCart(false);
      isUpdatingRef.current = false;
    }
  };

  const handleSearch = async (
    e?: FormEvent<HTMLFormElement>,
    pageNum?: number,
    pageSize?: number
  ) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchPage(0);
      setSearchTotalPages(0);
      setSearchTotalItems(0);
      return;
    }

    const currentPage = pageNum !== undefined ? pageNum : 0;
    const currentPageSize = pageSize !== undefined ? pageSize : searchPageSize;

    if (pageNum === undefined && pageSize === undefined) {
      setSearchPage(0); // Reset to first page on new search
    }

    if (pageSize !== undefined) {
      setSearchPageSize(pageSize);
    }

    setIsSearching(true);
    setError(null);
    try {
      const response = await inventoryApi.search(
        searchQuery.trim(),
        currentPage,
        currentPageSize
      );

      if (import.meta.env.DEV) {
        console.log('Raw search response from API:', response);
        console.log('Response type:', typeof response);
        console.log('Response.data:', response?.data);
        console.log('Response.page:', response?.page);
        console.log(
          'Is response.data an array?',
          Array.isArray(response?.data)
        );
      }

      // Response should be InventoryListResponse: { data: InventoryItem[], meta: unknown | null, page: {...} }
      // So response.data should be the array of InventoryItem[]
      let items: InventoryItem[] = [];

      if (response) {
        if (Array.isArray(response)) {
          // If response is directly an array
          items = response;
        } else if (response.data) {
          if (Array.isArray(response.data)) {
            // response.data is the array - this is the expected case
            items = response.data;
          } else if (
            response.data &&
            typeof response.data === 'object' &&
            'data' in response.data
          ) {
            // Handle nested structure: { data: { data: [...] } }
            const nestedData = (response.data as { data?: InventoryItem[] })
              .data;
            items = Array.isArray(nestedData) ? nestedData : [];
          }
        }
      }

      // Update pagination info
      if (response?.page) {
        setSearchTotalPages(response.page.totalPages);
        setSearchTotalItems(response.page.totalItems);
        setSearchPage(response.page.page);
      }

      if (import.meta.env.DEV) {
        console.log('Final extracted items:', items);
        console.log('Items count:', items.length);
        if (items.length > 0) {
          console.log('First item:', items[0]);
        }
      }

      setSearchResults(items);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to search products';
      setError(errorMessage);
      setSearchResults([]);
      if (import.meta.env.DEV) {
        console.error('Search error:', err);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToCart = async (item: InventoryItem, price?: number) => {
    // Use sellingPrice as default, or override with provided price
    const finalPrice = price !== undefined ? price : item.sellingPrice;

    if (finalPrice <= 0) {
      setError('Please enter a valid price');
      return;
    }

    if (item.currentCount <= 0) {
      setError('Product is out of stock');
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
          setError(`Only ${item.currentCount} items available in stock`);
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
          setError('Product is out of stock');
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

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) => {
      // Find the item before updating to track if it will be removed
      const originalItem = prev.find((item) => item.inventoryItem.id === id);
      if (!originalItem) {
        return prev;
      }

      const newQuantity = originalItem.quantity + delta;

      // If quantity would become 0 or less, we still need to send -1 to API for removal
      // But we'll filter it out from local state
      if (newQuantity <= 0) {
        // Item will be removed - send -1 to API with original item info, then filter out from local state
        const remainingItems = prev.filter(
          (item) => item.inventoryItem.id !== id
        );
        syncCartToAPI(remainingItems, id, delta, originalItem);
        return remainingItems;
      }

      // Only validate stock if we have accurate inventory data (not a minimal item)
      // Minimal items have currentCount set to 999999, so skip validation for those
      if (
        originalItem.inventoryItem.currentCount < 999999 &&
        newQuantity > originalItem.inventoryItem.currentCount
      ) {
        setError(
          `Only ${originalItem.inventoryItem.currentCount} items available in stock`
        );
        return prev;
      }

      const updatedItems = prev.map((item) => {
        if (item.inventoryItem.id === id) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });

      // Sync to API - only send the changed item with the delta quantity
      syncCartToAPI(updatedItems, id, delta);
      return updatedItems;
    });
    setError(null);
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

  const handleClearCart = async () => {
    // Get current cart items before clearing
    const currentItems = [...cartItems];

    // Clear local state
    setCartItems([]);
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
        setError(errorMessage);
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
      setError('Please enter a customer phone number');
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
      setError(errorMessage);
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
      setError('Cart is empty');
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
      <div className={styles.header}>
        <h2 className={styles.title}>Scan and Sell</h2>
        <p className={styles.subtitle}>Speed up sales with barcode scanning</p>
      </div>
      {error && <div className={styles.errorMessage}>{error}</div>}
      {/* Customer Information Section */}
      <div className={styles.customerSection}>
        <h4 className={styles.customerTitle}>Customer Information</h4>
        <div className={styles.customerFields}>
          <div className={styles.customerField}>
            <label htmlFor="customerPhone" className={styles.customerLabel}>
              Phone
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                id="customerPhone"
                type="tel"
                className={styles.customerInput}
                placeholder="Enter customer phone"
                value={customerPhone}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setCustomerPhone(e.currentTarget.value);
                }}
                disabled={isSearchingCustomer}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className={styles.searchBtn}
                onClick={handleCustomerSearch}
                disabled={isSearchingCustomer || !customerPhone.trim()}
              >
                {isSearchingCustomer ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
          <div className={styles.customerField}>
            <label htmlFor="customerName" className={styles.customerLabel}>
              Customer Name
            </label>
            <input
              id="customerName"
              type="text"
              className={styles.customerInput}
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setCustomerName(e.currentTarget.value);
              }}
            />
          </div>
          <div className={styles.customerField}>
            <label htmlFor="customerEmail" className={styles.customerLabel}>
              Email
            </label>
            <input
              id="customerEmail"
              type="email"
              className={styles.customerInput}
              placeholder="Enter customer email"
              value={customerEmail}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setCustomerEmail(e.currentTarget.value);
              }}
            />
          </div>
          <div className={styles.customerField}>
            <label htmlFor="customerAddress" className={styles.customerLabel}>
              Address
            </label>
            <input
              id="customerAddress"
              type="text"
              className={styles.customerInput}
              placeholder="Enter customer address"
              value={customerAddress}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setCustomerAddress(e.currentTarget.value);
              }}
            />
          </div>
        </div>

        {/* Retailer Checkbox */}
        <div className={styles.retailerCheckboxContainer}>
          <label className={styles.retailerCheckboxLabel}>
            <input
              type="checkbox"
              checked={isRetailer}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setIsRetailer(e.currentTarget.checked);
                // Clear retailer fields when unchecked
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

        {/* Retailer Information Section */}
        {isRetailer && (
          <div className={styles.retailerSection}>
            <h5 className={styles.retailerSectionTitle}>
              Retailer Information
            </h5>
            <div className={styles.customerFields}>
              <div className={styles.customerField}>
                <label htmlFor="customerGstin" className={styles.customerLabel}>
                  Customer GSTIN
                </label>
                <input
                  id="customerGstin"
                  type="text"
                  className={styles.customerInput}
                  placeholder="Enter customer GSTIN"
                  value={customerGstin}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setCustomerGstin(e.currentTarget.value);
                  }}
                />
              </div>
              <div className={styles.customerField}>
                <label htmlFor="customerDlNo" className={styles.customerLabel}>
                  Customer DL No
                </label>
                <input
                  id="customerDlNo"
                  type="text"
                  className={styles.customerInput}
                  placeholder="Enter customer DL No"
                  value={customerDlNo}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setCustomerDlNo(e.currentTarget.value);
                  }}
                />
              </div>
              <div className={styles.customerField}>
                <label htmlFor="customerPan" className={styles.customerLabel}>
                  Customer PAN
                </label>
                <input
                  id="customerPan"
                  type="text"
                  className={styles.customerInput}
                  placeholder="Enter customer PAN"
                  value={customerPan}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setCustomerPan(e.currentTarget.value);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className={styles.container}>
        {/* Product Search Section */}
        <div className={styles.searchSection}>
          <h3 className={styles.sectionTitle}>Product Search</h3>
          <form onSubmit={handleSearch} className={styles.searchForm}>
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
                placeholder="Search by product name, company, or barcode..."
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.currentTarget.value)
                }
                disabled={isSearching}
                autoFocus
              />
              <button
                type="submit"
                className={styles.searchBtn}
                disabled={isSearching}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          <div className={styles.resultsContainer}>
            {isSearching ? (
              <div className={styles.loading}>Searching...</div>
            ) : searchResults.length === 0 && searchQuery ? (
              <div className={styles.emptyState}>No products found</div>
            ) : searchResults.length > 0 ? (
              <>
                <div className={styles.resultsList}>
                  {searchResults.map((item) => (
                    <ProductResultItem
                      key={item.id}
                      item={item}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
                {searchTotalPages > 1 && (
                  <div className={styles.paginationBar}>
                    <button
                      className={styles.pageBtn}
                      disabled={searchPage === 0 || isSearching}
                      onClick={() => handleSearch(undefined, searchPage - 1)}
                    >
                      Previous
                    </button>
                    <span className={styles.pageInfo}>
                      Page {searchPage + 1} of {searchTotalPages} •{' '}
                      {searchTotalItems} items
                    </span>
                    <button
                      className={styles.pageBtn}
                      disabled={
                        searchPage >= searchTotalPages - 1 || isSearching
                      }
                      onClick={() => handleSearch(undefined, searchPage + 1)}
                    >
                      Next
                    </button>
                    <select
                      className={styles.pageSizeSelect}
                      value={searchPageSize}
                      onChange={(e) => {
                        const newSize = Number(e.target.value);
                        handleSearch(undefined, 0, newSize);
                      }}
                      disabled={isSearching}
                    >
                      <option value={10}>10 / page</option>
                      <option value={20}>20 / page</option>
                      <option value={50}>50 / page</option>
                    </select>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.emptyState}>
                Enter a search query to find products
              </div>
            )}
          </div>
        </div>

        {/* Cart and Total Section */}
        <div className={styles.cartSection}>
          <h3 className={styles.cartTitle}>Cart</h3>
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
                    <span className={styles.qty}>{cartItem.quantity}</span>
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
                      className={styles.removeBtn}
                      onClick={() =>
                        handleRemoveItem(cartItem.inventoryItem.id)
                      }
                      disabled={isUpdatingCart}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className={styles.cartSummary}>
            {isLoadingCart ? (
              <div className={styles.loading}>Loading cart...</div>
            ) : (
              <>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                {cartData &&
                  cartData.discountTotal &&
                  cartData.discountTotal > 0 && (
                    <div className={styles.summaryRow}>
                      <span>Discount</span>
                      <span>-₹{(cartData.discountTotal ?? 0).toFixed(2)}</span>
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
        </div>
      </div>
    </div>
  );
}

// Product Result Item Component
interface ProductResultItemProps {
  item: InventoryItem;
  onAddToCart: (item: InventoryItem, price?: number) => void;
}

function ProductResultItem({ item, onAddToCart }: ProductResultItemProps) {
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

  const handleAdd = () => {
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      return;
    }
    // Use the price from input (defaults to sellingPrice if not changed)
    if (priceValue !== item.sellingPrice) {
      onAddToCart(item, priceValue);
    } else {
      onAddToCart(item); // Use default sellingPrice
    }
    // Reset to sellingPrice after adding
    setPrice(item.sellingPrice.toString());
  };

  return (
    <div className={styles.resultItem}>
      <div className={styles.resultItemInfo}>
        <h4 className={styles.resultItemName}>
          {item.name || 'Unnamed Product'}
        </h4>
        {item.companyName && (
          <p className={styles.resultItemCompany}>
            Company: {item.companyName}
          </p>
        )}
        {item.barcode && (
          <p className={styles.resultItemBarcode}>Barcode: {item.barcode}</p>
        )}
        <p className={styles.resultItemStock}>Current: {item.currentCount}</p>
        <p className={styles.resultItemMRP}>
          MRP: ₹{item.maximumRetailPrice.toFixed(2)}
        </p>
        <p className={styles.resultItemExpiry}>
          Expires: {formatDate(item.expiryDate)}
        </p>
      </div>
      <div className={styles.resultItemActions}>
        <div className={styles.priceInputGroup}>
          <label className={styles.priceLabel}>Price:</label>
          <input
            type="number"
            className={styles.priceInput}
            placeholder={item.sellingPrice.toString()}
            value={price}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPrice(e.currentTarget.value)
            }
            step="0.01"
            min="0"
          />
        </div>
        <button
          className={styles.addBtn}
          onClick={handleAdd}
          disabled={
            item.currentCount <= 0 ||
            (price.trim() !== '' && parseFloat(price) <= 0) ||
            (price.trim() !== '' && isNaN(parseFloat(price)))
          }
        >
          Add
        </button>
      </div>
    </div>
  );
}
