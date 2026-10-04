package com.montagem.auth.controller

import com.montagem.auth.dto.LoginRequest
import com.montagem.auth.dto.LoginResponse
import com.montagem.auth.service.UserService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(private val userService: UserService) {

    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequest): LoginResponse =
        userService.login(request)

    @PostMapping("/logout")
    fun logout(): Map<String, String> = mapOf("message" to "Logout realizado com sucesso")
}
