'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import env from '@/config/env';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Plus,
  Users,
  Search,
  CheckCircle2,
  Info,
  MoreVertical,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface RoleItem {
  id: string;
  name: string;
  description: string;
  users_count: number;
  permissions_count: number;
  access_scope: 'All' | 'Department' | 'Unit' | 'Own';
  is_system: boolean;
  created_at: string;
}

export default function RolesAndPermissionsPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [metrics, setMetrics] = useState({
    total_roles: 0,
    users_with_roles: 0,
    avg_permissions: 0,
    system_roles: 0,
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('summayyah');
      const res = await axios.get(`${env.API_URL}/admin/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.roles) {
        setRoles(res.data.roles);
        if (res.data.metrics) {
          setMetrics(res.data.metrics);
        }
      }
    } catch (e) {
      console.error('Failed to load roles from backend:', e);
      toast.error('Failed to load roles from backend.');
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const getScopeBadge = (scope: string) => {
    switch (scope) {
      case 'All':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neon-emerald/15 text-neon-emerald border border-neon-emerald/30">
            All
          </span>
        );
      case 'Department':
        return (
          <div className="flex gap-1">
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-white/10 text-muted-foreground">Own</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-white/10 text-muted-foreground">Unit</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-neon-amber/20 text-neon-amber border border-neon-amber/30">
              Department
            </span>
          </div>
        );
      case 'Unit':
        return (
          <div className="flex gap-1">
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-white/10 text-muted-foreground">Own</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30">
              Unit
            </span>
          </div>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-muted-foreground">
            Own
          </span>
        );
    }
  };

  const filteredRoles = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Roles & Permissions</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Create and manage roles with granular, scope-based permission control.
          </p>
        </div>

        <Button
          onClick={() => {
            const roleName = prompt('Enter New Custom Role Name:');
            if (roleName) toast.success(`Role "${roleName}" created!`);
          }}
          className="bg-neon-violet text-white hover:bg-neon-violet/90 font-bold text-xs rounded-xl shadow-lg shadow-neon-violet/25"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>+ Create Role</span>
        </Button>
      </div>

      {/* Scope Alert Box (Screenshot 3 Alert) */}
      <div className="p-4 rounded-2xl bg-neon-cyan/5 border border-neon-cyan/20 flex items-start space-x-3 text-xs text-muted-foreground">
        <Info className="w-4 h-4 text-neon-cyan shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white block mb-0.5">Scope-based Access Control</span>
          <span>
            Own — user&apos;s own data only. Unit — all data within user&apos;s Unit. Department — entire department. All — institution-wide access. System roles cannot be deleted.
          </span>
        </div>
      </div>

      {/* KPI Cards (Screenshot 3 Top Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Roles</span>
            <p className="text-2xl font-black text-white mt-1">{metrics.total_roles}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-neon-violet/10 text-neon-violet">
            <Shield className="w-4 h-4" />
          </div>
        </Card>

        <Card className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Users with Roles</span>
            <p className="text-2xl font-black text-white mt-1">{metrics.users_with_roles}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-neon-cyan/10 text-neon-cyan">
            <Users className="w-4 h-4" />
          </div>
        </Card>

        <Card className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Avg. Permissions</span>
            <p className="text-2xl font-black text-white mt-1">{metrics.avg_permissions}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-neon-emerald/10 text-neon-emerald">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </Card>

        <Card className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">System Roles</span>
            <p className="text-2xl font-black text-white mt-1">{metrics.system_roles}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-neon-amber/10 text-neon-amber">
            <Lock className="w-4 h-4" />
          </div>
        </Card>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search roles..."
          className="pl-10 bg-black/50 border-white/10 text-xs rounded-xl focus:border-neon-violet"
        />
      </div>

      {/* Roles Table (Matching Screenshot 3 Exactly) */}
      <Card className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-white/[0.02]">
                <th className="py-4 px-6">ROLE</th>
                <th className="py-4 px-6">USERS</th>
                <th className="py-4 px-6">PERMISSIONS</th>
                <th className="py-4 px-6">ACCESS SCOPE</th>
                <th className="py-4 px-6">CREATED</th>
                <th className="py-4 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredRoles.map((role) => (
                <tr key={role.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* Role Name & Description */}
                  <td className="py-4 px-6 max-w-xs">
                    <div className="flex items-center space-x-2">
                      <p className="font-bold text-white">{role.name}</p>
                      {role.is_system && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-neon-violet/20 text-neon-violet border border-neon-violet/30">
                          SYSTEM
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{role.description}</p>
                  </td>

                  {/* Users Count */}
                  <td className="py-4 px-6 font-mono font-bold text-white flex items-center gap-1 mt-3">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{role.users_count}</span>
                  </td>

                  {/* Permissions Count */}
                  <td className="py-4 px-6 font-mono font-bold text-neon-cyan">{role.permissions_count}</td>

                  {/* Access Scope Pills */}
                  <td className="py-4 px-6">{getScopeBadge(role.access_scope)}</td>

                  {/* Created Date */}
                  <td className="py-4 px-6 text-muted-foreground font-mono text-[11px]">{role.created_at}</td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <button className="text-muted-foreground hover:text-white p-1.5 rounded-lg hover:bg-white/5">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
