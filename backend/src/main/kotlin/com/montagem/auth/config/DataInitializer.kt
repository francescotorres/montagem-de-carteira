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
        if (userRepository.count() == 0L) {
            val encoder = BCryptPasswordEncoder(12)
            userRepository.save(
                User(
                    nome = "admin",
                    passwordHash = encoder.encode("admin123")
                )
            )
            println("==================================================")
            println("  [INICIALIZAÇÃO] Nenhum usuário encontrado.")
            println("  Usuário inicial criado automaticamente:")
            println("  Usuário: admin")
            println("  Senha:   admin123")
            println("==================================================")
        }
    }
}
