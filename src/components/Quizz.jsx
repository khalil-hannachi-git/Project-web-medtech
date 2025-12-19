import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'
import api from '../api/client'
 export default function Quizz(){
   const { user } = useAuth()
   const { quizzId } = useParams()
   const [quizz, setQuizz] = useState(null)
   const [loading, setLoading] = useState(true)

   useEffect(() => {
        const fetchQuizz = async () => {
            const res = await api.get(`/quizz/${quizzId}`)
            setQuizz(res.data.quizz)
            setLoading(false)
        }
        fetchQuizz()
   }), [quizzId]

   if (loading) {
       return <div>Loading...</div>
   }

   return (
       <div className="p-6 bg-gray-950 min-h-screen">
           <h1 className="text-3xl font-bold mb-4">{quizz.title}</h1>
           <p className="text-gray-400">{quizz.description}</p>
       </div>
   )
 }