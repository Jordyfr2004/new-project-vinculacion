'use client';

import { supabase } from "@/lib/supabase/client";
import React, { useState } from "react";

export default function ReceptoresPage() {

  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [Ci, setCi] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1️⃣ Insertar en tabla users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{ email, password, rol: 'receptor' }])
        .select('id')
        .single();

      if (userError) throw userError;

      // 2️⃣ Insertar en tabla receptores
      const { error: receptorError } = await supabase.from('receptores').insert([
        {
          receptor_id: userData.id,
          nombres,
          apellidos,
          telefono,
          Ci, // 👈 nombre del campo igual a como está en la base
        },
      ]);

      if (receptorError) throw receptorError;

      // 3️⃣ Si todo va bien
      setMensaje('✅ Receptor registrado correctamente en Supabase');
      setNombres('');
      setApellidos('');
      setTelefono('');
      setCi('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      console.error(err);
      setMensaje('Error al guardar: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Registro de Receptores</h2>

      <input
        type="text"
        placeholder="Nombres"
        value={nombres}
        onChange={(e) => setNombres(e.target.value)}
      /><br />

      <input
        type="text"
        placeholder="Apellidos"
        value={apellidos}
        onChange={(e) => setApellidos(e.target.value)}
      /><br />

      <input
        type="text"
        placeholder="Teléfono"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
      /><br />

      <input
        type="text"
        placeholder="Cédula (CI)"
        value={Ci}
        onChange={(e) => setCi(e.target.value)}
      /><br />

      {/* 👇 Email y contraseña debajo del teléfono */}
      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      /><br />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br />

      <button type="submit">Registrar Receptor</button>

      <p>{mensaje}</p>
    </form>
  );
}
