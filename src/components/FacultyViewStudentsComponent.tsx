'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { achievementService } from '@/services/achievementService';
import { userService, UserProfile } from '@/services/userService';
import { Achievement, AchievementCategory } from '@/types';
import { useRouter } from 'next/navigation';
import { adminService } from '@/services/adminService';

// Types for internal state
interface StudentStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

interface StudentWithStats extends UserProfile {
  stats: StudentStats;
  achievements: Achievement[];
}

interface GroupedStudents {
  [department: string]: StudentWithStats[];
}

export const FacultyViewStudentsComponent = () => {
  const { user } = useAuth();
  
  // Data State
  const [students, setStudents] = useState<StudentWithStats[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentWithStats[]>([]);
  const [categories, setCategories] = useState<AchievementCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter State
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // View State
  const router = useRouter();

  // Initial Load
  useEffect(() => {
    loadData();
  }, [user]);

  // Filtering Logic - Re-run when filters or data change
  useEffect(() => {
    applyFilters();
  }, [students, selectedDept, selectedCategory, selectedStatus, searchTerm]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Categories
      const cats = await adminService.getCategories();
      setCategories(cats);

      // 2. Fetch Students
      const allStudents = await userService.getAllStudents();

      // 3. Fetch All Achievements to calculate stats
      const allAchievements = await achievementService.getAllAchievements();

      // 4. Merge Data
      const mergedData: StudentWithStats[] = allStudents.map(student => {
        const studentAchievements = allAchievements.filter(a => a.studentId === student.uid || a.studentEmail === student.email);
        
        return {
          ...student,
          achievements: studentAchievements,
          stats: {
            total: studentAchievements.length,
            approved: studentAchievements.filter(a => a.status === 'approved').length,
            pending: studentAchievements.filter(a => a.status === 'pending').length,
            rejected: studentAchievements.filter(a => a.status === 'rejected').length,
          }
        };
      });

      setStudents(mergedData);
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = students;

    // 1. Department Filter
    if (selectedDept !== 'All') {
      result = result.filter(s => (s.department || 'Unassigned') === selectedDept);
    }

    // 2. Search Filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(s => 
        (s.name || '').toLowerCase().includes(term) || 
        (s.email || '').toLowerCase().includes(term) ||
        (s.uid && s.uid.toLowerCase().includes(term))
      );
    }

    // 3. Category & Status Filter
    if (selectedCategory !== 'All' || selectedStatus !== 'All') {
      result = result.filter(s => {
        const matches = s.achievements.some(a => {
          const catMatch = selectedCategory === 'All' || a.category === selectedCategory;
          const statusMatch = selectedStatus === 'All' || a.status === selectedStatus;
          return catMatch && statusMatch;
        });
        return matches;
      });
    }

    setFilteredStudents(result);
  };

  // Grouping for Display
  const groupedStudents = filteredStudents.reduce((acc, student) => {
    const dept = student.department || 'Unassigned';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(student);
    return acc;
  }, {} as GroupedStudents);

  // Get unique departments for dropdown
  const departments = Array.from(new Set(students.map(s => s.department || 'Unassigned'))).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 p-6 animate-fade-in text-gray-800">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <span>👥</span> Student Directory
            </h1>
            <p className="text-blue-200 mt-1">View and search student achievement records</p>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20">
            <span className="font-bold text-2xl">{filteredStudents.length}</span> <span className="text-sm opacity-80">Students Found</span>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-white rounded-xl shadow-xl p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input 
                type="text" 
                placeholder="Search name, ID, email..." 
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Department */}
            <select 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="All">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            {/* Category */}
            <select 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>

            {/* Status */}
            <select 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
           <div className="flex items-center justify-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-yellow-400"></div>
           </div>
        ) : Object.keys(groupedStudents).length === 0 ? (
          <div className="text-center py-20 text-white opacity-60">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold">No students found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedStudents).map(([dept, deptStudents]) => (
              <div key={dept} className="animate-slide-up">
                <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-yellow-400 rounded-full inline-block"></span>
                  {dept} 
                  <span className="text-sm font-normal opacity-60 ml-2">({deptStudents.length})</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {deptStudents.map(student => (
                    <div 
                      key={student.uid}
                      onClick={() => router.push(`/faculty/students/${student.uid}`)}
                      className="bg-white rounded-xl shadow-lg p-6 hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer group border border-transparent hover:border-blue-400"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {(student.name || student.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="font-bold text-gray-800 truncate group-hover:text-blue-700 transition-colors">{student.name || 'Unknown Student'}</h3>
                          <p className="text-xs text-gray-500 truncate">{student.email}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-center text-xs py-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-bold text-gray-800 text-lg">{student.stats.total}</p>
                          <p className="text-gray-500">Total</p>
                        </div>
                        <div>
                          <p className="font-bold text-green-600 text-lg">{student.stats.approved}</p>
                          <p className="text-gray-500">Appr.</p>
                        </div>
                        <div>
                          <p className="font-bold text-yellow-600 text-lg">{student.stats.pending}</p>
                          <p className="text-gray-500">Pend.</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};
