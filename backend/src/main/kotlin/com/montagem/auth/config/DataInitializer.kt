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
        val encoder = BCryptPasswordEncoder(12)
        if (!userRepository.existsByNome("Francesco")) {
            userRepository.save(
                User(
                    nome = "Francesco",
                    passwordHash = encoder.encode("240322")
                )
            )
            println("==================================================")
            println("  Usuário Francesco inicializado:")
            println("  Usuário: Francesco")
            println("  Senha:   240322")
            println("==================================================")
        }
        if (!userRepository.existsByNome("admin")) {
            userRepository.save(
                User(
                    nome = "admin",
                    passwordHash = encoder.encode("admin123")
                )
            )
            println("==================================================")
            println("  Usuário admin inicializado:")
            println("  Usuário: admin")
            println("  Senha:   admin123")
            println("==================================================")
        }
    }
}
