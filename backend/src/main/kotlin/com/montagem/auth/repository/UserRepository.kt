package com.montagem.auth.repository

import com.montagem.auth.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional

interface UserRepository : JpaRepository<User, Long> {
    fun findByNome(nome: String): Optional<User>
    fun findByNomeIgnoreCase(nome: String): Optional<User>
    fun existsByNome(nome: String): Boolean
    fun existsByNomeIgnoreCase(nome: String): Boolean
}
