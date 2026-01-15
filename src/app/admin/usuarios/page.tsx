'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { usuariosService } from '@/lib/services/usuarios';
import type { User } from '@/types';
import Header from '@/components/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Table, { TableRow, TableCell } from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import Toast from '@/components/ui/Toast';
import { Users, Shield, UserCog, Search, Trash2 } from 'lucide-react';

export default function UsuariosAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState<string>('todos');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [nuevoRol, setNuevoRol] = useState<'admin' | 'donante' | 'receptor'>('donante');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    filterUsuarios();
  }, [usuarios, searchTerm, filterRol]);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('rol')
        .eq('id', user.id)
        .maybeSingle();

      if (!userData || userData.rol !== 'admin') {
        router.push('/');
        return;
      }

      loadUsuarios();
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/');
    }
  };

  const loadUsuarios = async () => {
    try {
      const data = await usuariosService.getUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error('Error loading usuarios:', error);
      showToast('Error al cargar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterUsuarios = () => {
    let filtered = [...usuarios];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.nombres?.toLowerCase().includes(term) ||
          u.apellidos?.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          u.ci?.toLowerCase().includes(term)
      );
    }

    if (filterRol !== 'todos') {
      filtered = filtered.filter((u) => u.rol === filterRol);
    }

    setFilteredUsuarios(filtered);
  };

  const handleOpenModal = (user: User) => {
    setSelectedUser(user);
    setNuevoRol(user.rol);
    setShowModal(true);
  };

  const handleActualizarRol = async () => {
    if (!selectedUser) return;

    try {
      await usuariosService.actualizarRolUsuario(selectedUser.id, nuevoRol);
      showToast('Rol actualizado correctamente', 'success');
      setShowModal(false);
      loadUsuarios();
    } catch (error) {
      console.error('Error actualizando rol:', error);
      showToast('Error al actualizar el rol', 'error');
    }
  };

  const handleToggleEstado = async (userId: string, activo: boolean) => {
    try {
      await usuariosService.toggleEstadoUsuario(userId, !activo);
      showToast(`Usuario ${!activo ? 'activado' : 'desactivado'} correctamente`, 'success');
      loadUsuarios();
    } catch (error) {
      console.error('Error cambiando estado:', error);
      showToast('Error al cambiar el estado', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenDeleteModal = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleEliminarUsuario = async () => {
    if (!userToDelete) return;

    try {
      await usuariosService.eliminarUsuario(userToDelete.id);
      showToast('Usuario eliminado correctamente', 'success');
      setShowDeleteModal(false);
      setUserToDelete(null);
      loadUsuarios();
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      showToast('Error al eliminar el usuario', 'error');
    }
  };

  const getRolBadge = (rol: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger'> = {
      admin: 'danger',
      donante: 'success',
      receptor: 'warning',
    };
    return <Badge variant={variants[rol] || 'success'}>{rol.toUpperCase()}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Gestión de Usuarios
          </h1>
          <p className="text-slate-400">
            Administra los usuarios del sistema y sus roles
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Usuarios</p>
                <p className="text-2xl font-bold text-white">{usuarios.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Administradores</p>
                <p className="text-2xl font-bold text-white">
                  {usuarios.filter((u) => u.rol === 'admin').length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-red-500" />
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Donantes</p>
                <p className="text-2xl font-bold text-white">
                  {usuarios.filter((u) => u.rol === 'donante').length}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Receptores</p>
                <p className="text-2xl font-bold text-white">
                  {usuarios.filter((u) => u.rol === 'receptor').length}
                </p>
              </div>
              <Users className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, email o CI..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Filtrar por Rol
              </label>
              <Select
                value={filterRol}
                onChange={(e) => setFilterRol(e.target.value)}
                options={[
                  { value: 'todos', label: 'Todos los roles' },
                  { value: 'admin', label: 'Administradores' },
                  { value: 'donante', label: 'Donantes' },
                  { value: 'receptor', label: 'Receptores' },
                ]}
              />
            </div>
          </div>
        </Card>

        {/* Tabla de Usuarios */}
        <Card>
          <div className="overflow-x-auto">
            <Table headers={['Usuario', 'Email', 'Rol', 'Estado', 'Fecha Registro', 'Acciones']}>
              {filteredUsuarios.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user.nombres?.[0]}{user.apellidos?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {user.nombres} {user.apellidos}
                        </p>
                        {user.ci && (
                          <p className="text-slate-400 text-sm">CI: {user.ci}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-300">{user.email}</span>
                  </TableCell>
                  <TableCell>
                    {getRolBadge(user.rol)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.activo ? 'success' : 'danger'}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-300">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(user)}
                      >
                        <UserCog className="w-4 h-4 mr-1" />
                        Cambiar Rol
                      </Button>
                      <Button
                        variant={user.activo ? 'danger' : 'primary'}
                        size="sm"
                        onClick={() => handleToggleEstado(user.id, user.activo)}
                      >
                        {user.activo ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleOpenDeleteModal(user)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          </div>
          
          {filteredUsuarios.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No se encontraron usuarios</p>
            </div>
          )}
        </Card>
      </main>

      {/* Modal Cambiar Rol */}
      {showModal && selectedUser && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Cambiar Rol de Usuario"
        >
          <div className="space-y-4">
            <div>
              <p className="text-slate-300 mb-2">
                <span className="font-semibold">Usuario:</span> {selectedUser.nombres} {selectedUser.apellidos}
              </p>
              <p className="text-slate-400 text-sm mb-4">
                {selectedUser.email}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nuevo Rol
              </label>
              <Select
                value={nuevoRol}
                onChange={(e) => setNuevoRol(e.target.value as 'admin' | 'donante' | 'receptor')}
                options={[
                  { value: 'admin', label: 'Administrador' },
                  { value: 'donante', label: 'Donante' },
                  { value: 'receptor', label: 'Receptor' },
                ]}
              />
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <p className="text-yellow-500 text-sm">
                ⚠️ Cambiar el rol de un usuario afectará sus permisos y acceso al sistema.
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="primary"
                onClick={handleActualizarRol}
                className="flex-1"
              >
                Confirmar Cambio
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Eliminar Usuario */}
      {showDeleteModal && userToDelete && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Eliminar Usuario"
        >
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Trash2 className="w-6 h-6 text-red-500 mt-1" />
                <div>
                  <p className="text-red-400 font-semibold mb-2">
                    ¿Estás seguro de eliminar este usuario?
                  </p>
                  <p className="text-slate-300 mb-2">
                    <span className="font-semibold">Usuario:</span> {userToDelete.nombres} {userToDelete.apellidos}
                  </p>
                  <p className="text-slate-400 text-sm mb-3">
                    {userToDelete.email}
                  </p>
                  <p className="text-red-300 text-sm">
                    ⚠️ Esta acción marcará al usuario como eliminado y desactivará su cuenta. Los datos permanecerán en el sistema pero el usuario no podrá acceder.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="danger"
                onClick={handleEliminarUsuario}
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Confirmar Eliminación
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
