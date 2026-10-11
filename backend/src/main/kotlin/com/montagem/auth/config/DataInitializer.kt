package com.montagem.auth.config

import com.montagem.auth.entity.User
import com.montagem.auth.repository.UserRepository
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder

@Configuration
class DataInitializer(
    private val userRepository: UserRepository
) {
    @Bean
    fun initDatabase(): CommandLineRunner = CommandLineRunner {
        // Inicializa o usuário temporário inicial SOMENTE se o banco estiver totalmente vazio (0 usuários)
        if (userRepository.count() == 0L) {
            val encoder = BCryptPasswordEncoder(12)
            val defaultPassword = "123456"
            userRepository.save(
                User(
                    nome = "Francesco",
                    passwordHash = encoder.encode(defaultPassword)
                )
            )
            println("==================================================")
            println("  Banco vazio: criado usuário temporário inicial:")
            println("  Usuário: Francesco")
            println("  Senha:   $defaultPassword")
            println("  (Será removido automaticamente ao cadastrar um novo usuário)")
            println("==================================================")
        }
    }
}
