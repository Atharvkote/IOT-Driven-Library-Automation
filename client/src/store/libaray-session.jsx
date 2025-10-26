"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import axios from "axios"

const LibraryContext = createContext()

export const LibraryProvider = ({ children }) => {
    const [student, setStudent] = useState(null)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [latestScan, setLatestScan] = useState(null)
    const [loading, setLoading] = useState(true)

    const API_URL = import.meta.env.VITE_API_URL + "/rfid/is-active"

    const checkLoginStatus = useCallback(async (prn_number) => {
        if (!prn_number) return false;

        try {
            const res = await axios.post(API_URL, { prn_number })
            if (res.data.success) {
                setStudent(res.data.student)
                setLatestScan(res.data.latestScan)
                setIsLoggedIn(res.data.isActive)

                if (res.data.isActive) {
                    localStorage.setItem("rfid_prn", prn_number)
                    localStorage.setItem("rfid_student", JSON.stringify(res.data.student))
                } else {
                    localStorage.removeItem("rfid_prn")
                    localStorage.removeItem("rfid_student")
                }

                return res.data.isActive // return value
            }
        } catch (error) {
            console.error(error)
            return false
        } finally {
            setLoading(false)
        }
    }, [])


    useEffect(() => {
        console.log("isLoggedIn changed:", isLoggedIn)
        if (isLoggedIn) {
            console.log("Student is logged in:", student)
        }
    }, [isLoggedIn, student])


    const logout = useCallback(() => {
        setIsLoggedIn(false)
        setStudent(null)
        setLatestScan(null)
        localStorage.removeItem("rfid_prn")
        localStorage.removeItem("rfid_student")
    }, [])

    useEffect(() => {
        const savedPrn = localStorage.getItem("rfid_prn")
        if (!savedPrn) {
            setLoading(false)
            return
        }
        console.log("Checking saved RFID login for PRN:", savedPrn)
        checkLoginStatus(savedPrn)

        const interval = setInterval(() => {
            checkLoginStatus(savedPrn)
        }, 60000)

        return () => clearInterval(interval)
    }, [checkLoginStatus])

    return (
        <LibraryContext.Provider
            value={{
                student,
                isLoggedIn,
                latestScan,
                loading,
                checkLoginStatus,
                logout,
            }}
        >
            {children}
        </LibraryContext.Provider>
    )
}

export const useLibrary = () => useContext(LibraryContext)
