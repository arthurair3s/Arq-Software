using Data;
using Features.GerenciamentoEntregadores;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                      ?? builder.Configuration["ConnectionStrings:DefaultConnection"];

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
{
  var redisConfig = builder.Configuration.GetConnectionString("RedisConnection")
                   ?? builder.Configuration["ConnectionStrings:RedisConnection"]
                   ?? "localhost:6379";

  return ConnectionMultiplexer.Connect(redisConfig);
});

builder.Services.AddScoped<EntregadorRepository>();

builder.Services.AddGrpc();

var app = builder.Build();

app.MapGrpcService<EntregadorService>();

app.MapGet("/", () => "O Microserviço de Entregadores está rodando via gRPC.");

app.Run();