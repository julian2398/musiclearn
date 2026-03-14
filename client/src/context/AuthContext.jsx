import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../services/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const docSnap = await getDoc(doc(db, 'usuarios', firebaseUser.uid))
        if (docSnap.exists()) {
          setUser({ uid: firebaseUser.uid, id: firebaseUser.uid, ...docSnap.data() })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const register = async ({ name, email, password, role }) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    const uid = credential.user.uid
    const userData = {
      name,
      email,
      role,
      instrument: '',
      level: '',
      modality: '',
      goal: '',
      phone: '',
      bio: '',
      avatar_url: '',
      onboarding_complete: false,
      created_at: new Date().toISOString(),
    }
    await setDoc(doc(db, 'usuarios', uid), userData)
    const newUser = { uid, id: uid, ...userData }
    setUser(newUser)
    return newUser
  }

  const login = async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    const docSnap = await getDoc(doc(db, 'usuarios', credential.user.uid))
    if (!docSnap.exists()) throw new Error('Usuario no encontrado')
    const userData = { uid: credential.user.uid, id: credential.user.uid, ...docSnap.data() }
    setUser(userData)
    return userData
  }

  const updateProfile = async (data) => {
    if (!user?.uid) throw new Error('No hay sesión activa')
    await updateDoc(doc(db, 'usuarios', user.uid), data)
    setUser(prev => ({ ...prev, ...data }))
    return { ...user, ...data }
  }

  const logout = () => {
    signOut(auth)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}