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
        val defaultPassword = "123456"

        val francescoOpt = userRepository.findByNomeIgnoreCase("Francesco")
        if (francescoOpt.isEmpty) {
            userRepository.save(
                User(
                    nome = "Francesco",
                    passwordHash = encoder.encode(defaultPassword)
                )
            )
        } else {
            val user = francescoOpt.get()
            user.passwordHash = encoder.encode(defaultPassword)
            userRepository.save(user)
        }
        println("==================================================")
        println("  Usuário Francesco inicializado/atualizado:")
        println("  Usuário: Francesco")
        println("  Senha:   $defaultPassword")
        println("==================================================")

        val adminOpt = userRepository.findByNomeIgnoreCase("admin")
        if (adminOpt.isEmpty) {
            userRepository.save(
                User(
                    nome = "admin",
                    passwordHash = encoder.encode(defaultPassword)
                )
            )
        } else {
            val user = adminOpt.get()
            user.passwordHash = encoder.encode(defaultPassword)
            userRepository.save(user)
        }
        println("==================================================")
        println("  Usuário admin inicializado/atualizado:")
        println("  Usuário: admin")
        println("  Senha:   $defaultPassword")
        println("==================================================")
    }
}
