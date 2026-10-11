package com.montagem.auth.controller

import com.montagem.auth.dto.CreateUserRequest
import com.montagem.auth.dto.UserResponse
import com.montagem.auth.service.UserService
import org.springframework.http.HttpStatus
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/users")
class UserController(private val userService: UserService) {

    @GetMapping
    fun listUsers(): List<UserResponse> = userService.listUsers()

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createUser(@RequestBody request: CreateUserRequest): UserResponse =
        userService.createUser(request)

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteUser(@PathVariable id: Long) {
        val currentNome = SecurityContextHolder.getContext().authentication?.name ?: ""
        userService.deleteUser(id, currentNome)
    }

    @PutMapping("/{id}/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun updatePassword(@PathVariable id: Long, @RequestBody body: Map<String, String>) {
        val newSenha = body["senha"] ?: body["newPassword"] ?: body["password"] ?: ""
        userService.updatePassword(id, newSenha)
    }
}
