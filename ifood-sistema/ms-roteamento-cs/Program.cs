using Features.ProcessamentoRotas;
using Features.ProcessamentoRotas.Contracts;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddGrpc();

builder.Services.AddHttpClient<IRoteamentoService, RoteamentoLogic>(client =>
{
    var osrmUrl = builder.Configuration["OSRM_URL"] ?? "http://osrm-server:5000/";
    client.BaseAddress = new Uri(osrmUrl);
});

var app = builder.Build();

app.MapGrpcService<RoteamentoService>();

app.MapGet("/", () => "Serviço de Roteamento gRPC ativo.");

app.Run();