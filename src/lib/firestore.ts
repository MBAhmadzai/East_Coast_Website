import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Query,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase';

// Generic helper to convert Firestore docs to typed objects
export const docToObject = <T>(doc: DocumentData): T => {
  return { id: doc.id, ...doc.data() } as T;
};

// Products
export const getProducts = async (constraints: QueryConstraint[] = []) => {
  const q = query(collection(db, 'products'), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToObject(doc));
};

export const getProductById = async (id: string) => {
  const docRef = doc(db, 'products', id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return docToObject(snapshot);
};

// Brands
export const getBrands = async (constraints: QueryConstraint[] = []) => {
  const q = query(collection(db, 'brands'), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToObject(doc));
};

// Categories
export const getCategories = async () => {
  const snapshot = await getDocs(collection(db, 'categories'));
  return snapshot.docs.map(doc => docToObject(doc));
};

// Orders
export const getOrders = async (userId?: string) => {
  let q;
  if (userId) {
    q = query(collection(db, 'orders'), where('user_id', '==', userId), orderBy('created_at', 'desc'));
  } else {
    q = query(collection(db, 'orders'), orderBy('created_at', 'desc'));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToObject(doc));
};

export const createOrder = async (orderData: any) => {
  const docRef = await addDoc(collection(db, 'orders'), {
    ...orderData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  return { id: docRef.id, ...orderData };
};

export const updateOrder = async (id: string, data: any) => {
  const docRef = doc(db, 'orders', id);
  await updateDoc(docRef, { ...data, updated_at: new Date().toISOString() });
};

export const deleteOrder = async (id: string) => {
  await deleteDoc(doc(db, 'orders', id));
};

// Order Items
export const createOrderItems = async (items: any[]) => {
  const promises = items.map(item => 
    addDoc(collection(db, 'order_items'), {
      ...item,
      created_at: new Date().toISOString()
    })
  );
  await Promise.all(promises);
};

export const deleteOrderItems = async (orderId: string) => {
  const q = query(collection(db, 'order_items'), where('order_id', '==', orderId));
  const snapshot = await getDocs(q);
  const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};

// Profiles
export const getProfile = async (userId: string) => {
  const q = query(collection(db, 'profiles'), where('user_id', '==', userId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return docToObject(snapshot.docs[0]);
};

// User Roles
export const getUserRoles = async () => {
  const snapshot = await getDocs(collection(db, 'user_roles'));
  return snapshot.docs.map(doc => docToObject(doc));
};

export const addUserRole = async (userId: string, role: string) => {
  await addDoc(collection(db, 'user_roles'), {
    user_id: userId,
    role,
    created_at: new Date().toISOString()
  });
};

export const removeUserRole = async (userId: string, role: string) => {
  const q = query(
    collection(db, 'user_roles'), 
    where('user_id', '==', userId),
    where('role', '==', role)
  );
  const snapshot = await getDocs(q);
  const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};

// Wholesale Customers
export const getWholesaleCustomers = async () => {
  const snapshot = await getDocs(collection(db, 'wholesale_customers'));
  return snapshot.docs.map(doc => docToObject(doc));
};

export const createWholesaleCustomer = async (data: any) => {
  await addDoc(collection(db, 'wholesale_customers'), {
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
};

export const updateWholesaleCustomer = async (id: string, data: any) => {
  const docRef = doc(db, 'wholesale_customers', id);
  await updateDoc(docRef, { ...data, updated_at: new Date().toISOString() });
};

export const deleteWholesaleCustomer = async (id: string) => {
  await deleteDoc(doc(db, 'wholesale_customers', id));
};

// Site Settings
export const getSiteSetting = async (key: string) => {
  const q = query(collection(db, 'site_settings'), where('key', '==', key));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return docToObject(snapshot.docs[0]);
};

export const updateSiteSetting = async (key: string, value: any) => {
  const q = query(collection(db, 'site_settings'), where('key', '==', key));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    await addDoc(collection(db, 'site_settings'), {
      key,
      value,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  } else {
    await updateDoc(snapshot.docs[0].ref, { 
      value, 
      updated_at: new Date().toISOString() 
    });
  }
};

// Products CRUD
export const createProduct = async (data: any) => {
  const docRef = await addDoc(collection(db, 'products'), {
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  return { id: docRef.id, ...data };
};

export const updateProduct = async (id: string, data: any) => {
  const docRef = doc(db, 'products', id);
  await updateDoc(docRef, { ...data, updated_at: new Date().toISOString() });
};

export const deleteProduct = async (id: string) => {
  await deleteDoc(doc(db, 'products', id));
};

// Brands CRUD
export const updateBrand = async (id: string, data: any) => {
  const docRef = doc(db, 'brands', id);
  await updateDoc(docRef, { ...data, updated_at: new Date().toISOString() });
};

// Media Library
export const getMediaLibrary = async (searchTerm?: string) => {
  const snapshot = await getDocs(collection(db, 'media_library'));
  let items = snapshot.docs.map(doc => docToObject(doc));
  if (searchTerm) {
    items = items.filter((item: any) => 
      item.file_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  return items;
};

export const createMediaItem = async (data: any) => {
  await addDoc(collection(db, 'media_library'), {
    ...data,
    created_at: new Date().toISOString()
  });
};

export const deleteMediaItem = async (id: string) => {
  await deleteDoc(doc(db, 'media_library', id));
};

// Get all profiles (for admin users page)
export const getProfiles = async () => {
  const q = query(collection(db, 'profiles'), orderBy('created_at', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToObject(doc));
};
