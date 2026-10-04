package com.montagem.auth.dto
data class LoginResponse(val token: String, val nome: String, val expiresIn: Long)
