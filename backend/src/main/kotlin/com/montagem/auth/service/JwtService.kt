package com.montagem.auth.service

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.Date
import javax.crypto.SecretKey

@Service
class JwtService(
    @Value("\${app.jwt.secret}") private val secret: String,
    @Value("\${app.jwt.expiration-ms}") private val expirationMs: Long
) {
    private val key: SecretKey by lazy {
        Keys.hmacShaKeyFor(secret.toByteArray())
    }

    fun generateToken(nome: String): String {
        val now = Date()
        return Jwts.builder()
            .subject(nome)
            .issuedAt(now)
            .expiration(Date(now.time + expirationMs))
            .signWith(key)
            .compact()
    }

    fun extractNome(token: String): String {
        return Jwts.parser().verifyWith(key).build()
            .parseSignedClaims(token).payload.subject
    }

    fun isTokenValid(token: String): Boolean {
        return try {
            val claims = Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).payload
            claims.expiration.after(Date())
        } catch (e: Exception) { false }
    }

    fun getExpirationMs() = expirationMs
}
