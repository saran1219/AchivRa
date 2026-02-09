'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { adminService } from '@/services/adminService';
import { AchievementCategory } from '@/types';
import { Navbar, Sidebar, PageLayout } from '@/components/Layout';

export default function CategoriesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<AchievementCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await adminService.getCategories();
      setCategories(data);
      setCategoriesLoading(false);
    };
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);

    try {
      const slug = newCategoryName.toLowerCase().replace(/\s+/g, '-');
      await adminService.addCategory(newCategoryName, slug, newCategoryDesc, categories.length);
      const updatedCategories = await adminService.getCategories();
      setCategories(updatedCategories);
      setNewCategoryName('');
      setNewCategoryDesc('');
    } catch (error) {
      console.error('Error adding category:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('Are you sure?')) {
      try {
        await adminService.deleteCategory(categoryId);
        setCategories(categories.filter((c) => c.id !== categoryId));
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  if (loading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <Sidebar>
        <PageLayout title="Manage Categories">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {categoriesLoading ? (
                <div>Loading categories...</div>
              ) : (
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category.id} className="bg-white p-4 rounded-lg shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold">{category.name}</h3>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-4">Add New Category</h3>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category Name</label>
                  <input
                    type="text"
                    placeholder="Enter category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    placeholder="Enter category description"
                    value={newCategoryDesc}
                    onChange={(e) => setNewCategoryDesc(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={adding}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
                >
                  {adding ? 'Adding...' : 'Add Category'}
                </button>
              </form>
            </div>
          </div>
        </PageLayout>
      </Sidebar>
    </>
  );
}
