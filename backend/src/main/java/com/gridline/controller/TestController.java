package com.gridline.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "✅ Gridline Backend está funcionando!");
        return response;
    }

    @GetMapping("/db/test")
    public Map<String, String> testDatabase() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "🟢 Banco de dados H2 conectado com sucesso!");
        return response;
    }

    @GetMapping("/debug/config")
    public Map<String, String> getConfig() {
        Map<String, String> response = new HashMap<>();
        response.put("h2Console", "http://localhost:8080/h2-console");
        response.put("port", "8080");
        response.put("status", "active");
        return response;
    }
}