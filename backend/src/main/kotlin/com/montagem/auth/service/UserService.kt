package com.montagem.auth.service

import com.montagem.auth.dto.CreateUserRequest
import com.montagem.auth.dto.LoginRequest
import com.montagem.auth.dto.LoginResponse
import com.montagem.auth.dto.UserResponse
import com.montagem.auth.entity.User
import com.montagem.auth.repository.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

@Service
class UserService(
    private val userRepository: UserRepository,
    private val jwtService: JwtService
) {
    private val encoder = BCryptPasswordEncoder(12)

    fun login(request: LoginRequest): LoginResponse {
        val trimmedNome = request.nome.trim()
        val trimmedSenha = request.senha.trim()
        val user = userRepository.findByNomeIgnoreCase(trimmedNome)
            .orElseThrow { ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas") }
        if (!encoder.matches(trimmedSenha, user.passwordHash))
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas")
        val token = jwtService.generateToken(user.nome)
        return LoginResponse(token, user.nome, jwtService.getExpirationMs())
    }

    fun listUsers(): List<UserResponse> =
        userRepository.findAll().map { UserResponse(it.id, it.nome) }

    fun createUser(request: CreateUserRequest): UserResponse {
        val trimmedNome = request.nome.trim()
        val trimmedSenha = request.senha.trim()
        if (userRepository.existsByNomeIgnoreCase(trimmedNome))
            throw ResponseStatusException(HttpStatus.CONFLICT, "Nome já cadastrado")
        if (trimmedSenha.length < 6)
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Senha deve ter ao menos 6 caracteres")
        val hash = encoder.encode(trimmedSenha)
        val saved = userRepository.save(User(nome = trimmedNome, passwordHash = hash))
        return UserResponse(saved.id, saved.nome)
    }

    fun deleteUser(id: Long, currentNome: String) {
        val user = userRepository.findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado") }
        if (user.nome == currentNome)
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Você não pode excluir a si mesmo")
        userRepository.deleteById(id)
    }
}
