import React, { createContext, useContext, useState, useEffect } from "react"

import { apolloClient } from "../graphql/client";

import { SignIn } from "../graphql/mutations";

import api from '../services/api'

interface AuthContextData {
    signed: boolean
    loading: boolean
    token: string
    user: user
    emailError: string
    passwordError: string
    signIn(email: string, password: string): Promise<void>
    signOut(): void
    setEmailError: React.Dispatch<React.SetStateAction<string>>
    setPasswordError: React.Dispatch<React.SetStateAction<string>>
}

interface user {
    email: string
    password: string
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

interface IAuthProviderProp {
    children: React.ReactNode
}

export const AuthProvider: React.FC<IAuthProviderProp> = ({ children }) => {
    const [token, setToken] = useState('')
    const [user, setUser] = useState<user>({} as user)
    const [signed, setSigned] = useState(false)
    const [loading, setLoading] = useState(false)

    const [emailError, setEmailError] = useState('')
    const [passwordError, setPasswordError] = useState('')

    useEffect(() => {
        if(localStorage.getItem('userEmail')) {
            const email = localStorage.getItem('userEmail')
            const token = localStorage.getItem('userToken')

            api.defaults.headers.Authorization = `Bearer ${token}`

            setUser({
                email
            } as user)
            setToken(token as string)
            setSigned(true)
        }
    }, [])
    
    function signOut() {
        localStorage.clear()
        api.defaults.headers.Authorization = ''
        setSigned(false)
    }

    async function signIn(email: string, password: string) {
        setLoading(true)
        
        apolloClient.mutate({
            mutation: SignIn,
            variables: {
                email: email,
                password: password
            }
        })
        .then((response:any) => {
            if (response.data !== null) {
                const token = response.data.login
                api.defaults.headers.Authorization = `Bearer ${token}`
                localStorage.setItem('userToken', token)
                localStorage.setItem('userEmail', email.toString())
                setUser(user)
                setToken(token)
                setSigned(true)
                setLoading(false)
            }
        })
        .catch((error:any) => {
            setLoading(false)
            console.log("fail");
            const { errors, message } = error.errors.data
    
            if (error.response.status === 400) {
              errors.Email && setEmailError(errors.Email[0])
              errors.Password && setPasswordError(errors.Password[0])
            } else if (error.response.status === 404) {
              setEmailError(message)
            } else {
              setEmailError(`Algo deu errado. Cód.: ${error.response.status}`)
            }
        })

        

        // await api
        //   .post('login', {
        //     email,
        //     password,
        // })
        // .then((response:any) => {
        //     if (response.status === 200) {
        //       const { user, token } = response.data
        //       api.defaults.headers.Authorization = `Bearer ${token}`
        //       setUser(user)
        //       setToken(token)
        //       setSigned(true)
        //       setLoading(false)
        //     }
        // })
        // .catch((error:any) => {
        //     setLoading(false)
        //     const { errors, message } = error.response.data
    
        //     if (error.response.status === 400) {
        //       errors.Email && setEmailError(errors.Email[0])
        //       errors.Password && setPasswordError(errors.Password[0])
        //     } else if (error.response.status === 404) {
        //       setEmailError(message)
        //     } else {
        //       setEmailError(`Algo deu errado. Cód.: ${error.response.status}`)
        //     }
        // })
    }

    return (
        <AuthContext.Provider
            value={{
                signed,
                loading,
                token,
                user,
                emailError,
                passwordError,
                signIn,
                signOut,
                setEmailError,
                setPasswordError,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuthContext() {
    const context = useContext(AuthContext)
    const {
        signed,
        loading,
        token,
        user,
        emailError,
        passwordError,
        signIn,
        signOut,
        setEmailError,
        setPasswordError
    } = context
    return {
        signed,
        loading,
        token,
        user,
        emailError,
        passwordError,
        signIn,
        signOut,
        setEmailError,
        setPasswordError
    }
  }
  
  export default AuthContext
