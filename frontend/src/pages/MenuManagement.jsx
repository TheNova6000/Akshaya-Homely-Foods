import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { fetchMenu, createMenuItem, updateMenuItem, deleteMenuItem } from '../utils/api';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const categories = [
  'Veg Pickles',
  'Non Veg Pickles',
  'Sweets',
  'Snacks Hot Items',
  'Honey',
  'Pure Ghee',
  'Dry Fruits',
  'Millets',
  'Powders Podis',
  'Masala Spices',
  'Cold Pressed Oils',
  'Traditional Laddus',
];

const menuItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.string()
    .min(1, 'Price is required')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
      message: 'Price must be a valid positive number',
    }),
  is_available: z.boolean().default(true),
  image_url: z.string().optional().or(z.literal('')),
});

export default function MenuManagement() {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null means adding new item

  const { data: menuItems = [], isLoading, isError } = useQuery({
    queryKey: ['menu'],
    queryFn: fetchMenu,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: '',
      category: categories[0],
      price: '',
      is_available: true,
    },
  });

  // Toggle availability mutation
  const toggleAvailableMutation = useMutation({
    mutationFn: ({ id, is_available }) => updateMenuItem(id, { is_available }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success('Availability status updated');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update availability');
    },
  });

  // Create menu item mutation
  const createMutation = useMutation({
    mutationFn: createMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success('New menu item created');
      closeModal();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create menu item');
    },
  });

  // Update menu item mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateMenuItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success('Menu item updated successfully');
      closeModal();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update menu item');
    },
  });

  // Delete menu item mutation
  const deleteMutation = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success('Menu item deleted');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete menu item');
    },
  });

  const handleToggle = (id, currentVal) => {
    toggleAvailableMutation.mutate({ id, is_available: !currentVal });
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    reset({
      name: '',
      category: categories[0],
      price: '',
      is_available: true,
      image_url: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    reset({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      is_available: item.is_available,
      image_url: item.image_url || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const onSubmit = (data) => {
    const payload = {
      ...data,
      price: parseFloat(data.price),
    };
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const filteredItems = activeCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Topbar title="Menu Management" />

        {/* Top Header Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', flex: 1 }}>
            <button
              onClick={() => setActiveCategory('All')}
              className={`btn btn-sm ${activeCategory === 'All' ? 'btn-primary' : 'btn-outline'}`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-outline'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button onClick={openAddModal} className="btn btn-primary" style={{ marginLeft: '1rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add New Item
          </button>
        </div>

        {/* Menu Items Grid */}
        {isLoading ? (
          <div className="menu-grid">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="card menu-card skeleton" style={{ minHeight: '160px' }} />
            ))}
          </div>
        ) : isError ? (
          <div style={{ textAlign: 'center', color: 'var(--danger)', padding: '2rem' }}>
            Failed to load menu list. Please try again.
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No menu items found in category "{activeCategory}". Click "Add New Item" to populate.
          </div>
        ) : (
          <div className="menu-grid">
            {filteredItems.map((item) => (
              <div key={item.id} className="card menu-card" style={{ opacity: item.is_available ? 1 : 0.7, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {item.image_url ? (
                  <div style={{ width: '100%', height: '140px', overflow: 'hidden' }}>
                    <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '140px', overflow: 'hidden', background: '#F5EFEB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '2rem' }}>
                    🍽️
                  </div>
                )}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                  <div className="menu-card-header">
                    <div>
                      <h4 className="menu-item-name" style={{ margin: 0 }}>{item.name}</h4>
                      <span className="menu-item-category">{item.category}</span>
                    </div>
                    <span className="menu-item-price">₹{item.price}</span>
                  </div>

                  <div className="menu-card-actions" style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-muted)' }}>
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </span>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={item.is_available}
                          onChange={() => handleToggle(item.id, item.is_available)}
                          disabled={toggleAvailableMutation.isPending}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => openEditModal(item)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Delete"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
                <button onClick={closeModal} className="modal-close">&times;</button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">Item Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Tomato Pickle"
                      {...register('name')}
                    />
                    {errors.name && <span className="form-error">{errors.name.message}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" {...register('category')}>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.category && <span className="form-error">{errors.category.message}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Price (₹)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 250"
                      {...register('price')}
                    />
                    {errors.price && <span className="form-error">{errors.price.message}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Image URL (Optional)</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="e.g. https://images.unsplash.com/..."
                      {...register('image_url')}
                    />
                    {errors.image_url && <span className="form-error">{errors.image_url.message}</span>}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input
                      type="checkbox"
                      id="is_available_checkbox"
                      {...register('is_available')}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                    />
                    <label htmlFor="is_available_checkbox" className="form-label" style={{ cursor: 'pointer', marginBottom: 0 }}>
                      Mark as Available immediately
                    </label>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={closeModal} className="btn btn-outline">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingItem ? 'Save Changes' : 'Create Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
