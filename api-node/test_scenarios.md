# Cenários de Teste GraphQL - API Node

Use estes cenários no seu Apollo Sandbox (http://localhost:4000) para validar a refatoração, as novas validações Zod e o sistema de erros.

## 1. Usuários e Autenticação

### Registro de Usuário (Sucesso)
```graphql
mutation CriarUsuario {
  criarUsuario(
    nome: "Arthur Teste"
    email: "arthur@exemplo.com"
    senha: "senhaSegura123"
    telefone: "11999999999"
  ) {
    id
    nome
    email
  }
}
```

### Registro de Usuário (Erro de Validação Zod)
*Tente registrar com uma senha curta (menos de 6 caracteres):*
```graphql
mutation RegistroFalho {
  criarUsuario(
    nome: "Ar"
    email: "email-invalido"
    senha: "123"
  ) {
    id
  }
}
```
> **Resultado Esperado**: Erro com a mensagem exata do primeiro campo inválido (ex: "E-mail em formato inválido").

### Login e Token
```graphql
mutation FazerLogin {
  login(email: "arthur@exemplo.com", senha: "senhaSegura123") {
    token
    usuario {
      nome
    }
  }
}
```
> **Nota**: Copie o `token` retornado para usar no Header `Authorization: Bearer <token>` nos próximos testes que exigem login.

---

## 2. Endereços e Geocoding

### Atualizar Endereço via Texto (Aciona Geocoding)
```graphql
mutation AtualizarEnderecoTexto {
  atualizarEndereco(
    endereco: "Avenida Paulista, 1000, São Paulo"
  ) {
    id
    endereco
    latitude
    longitude
  }
}
```

### Atualizar Endereço via Coordenadas (GPS)
```graphql
mutation AtualizarEnderecoGPS {
  atualizarEndereco(
    latitude: -23.5611
    longitude: -46.6559
    endereco: "Localização GPS Manual"
  ) {
    id
    latitude
    longitude
  }
}
```

---

## 3. Pedidos e Orquestração

### Criar Novo Pedido
```graphql
mutation NovoPedido {
  criarPedido(
    usuario_id: "COLOQUE_ID_DO_USUARIO_AQUI"
    restaurante_id: "1"
    valor_total: 85.50
    destino_latitude: -23.5631
    destino_longitude: -46.6544
  ) {
    id
    status
    valor_total
  }
}
```
> **Importante**: Verifique o log do Docker da API ao rodar esta mutation. Você deverá ver as mensagens de log estruturado que implementamos sobre a orquestração da entrega.

---

## 4. Entregadores (Módulo Inteligente)

### Povoar Frota (Teste de Script)
```graphql
mutation PovoarEntregadores {
  povoarFrota
}
```

### Atualizar Status (Enum Strict)
```graphql
mutation AtualizarStatus {
  atualizarStatusEntregador(
    id: "1"
    novoStatus: DISPONIVEL
  ) {
    id
    status
  }
}
```

---

## 5. Consultas (Queries)

### Perfil do Usuário Logado (Me)
```graphql
query Perfil {
  me {
    id
    nome
    email
    endereco
  }
}
```

### Buscar Entregadores Próximos
```graphql
query Radar {
  buscarEntregadoresProximos(
    latitude: -23.5631
    longitude: -46.6544
    raioKm: 5.0
  ) {
    nome
    distanciaKm
  }
}
```

## Dicas para o Apollo Sandbox
1. **HTTP Headers**: Se o Sandbox reclamar de "Not Authenticated", adicione na aba superior:
   ```json
   {
     "Authorization": "Bearer SEU_TOKEN_AQUI"
   }
   ```
2. **Variables**: Você pode usar a aba "Variables" para não deixar os dados hardcoded no corpo da mutation.
