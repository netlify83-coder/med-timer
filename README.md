# Timer 6h / 8h

Pequeno app local para marcar ações (ex.: tomar remédio) e contar intervalo de 6h e 8h.

Como usar
- Abra `index.html` no navegador.
- Ou inicie um servidor simples na pasta com:

```bash
python -m http.server 8000
# e abra http://localhost:8000
```

Comportamento
- Clique em `Marcar ação` para registrar o horário.
- O app mostra a hora da última marcação, tempo decorrido e tempo restante até a próxima vez (6h ou 8h).
- Após marcar, o botão fica bloqueado por 3 minutos (para evitar marcações acidentais). Depois de 3 minutos, você pode marcar novamente.

Persistência
- As marcações são salvas no `localStorage` do navegador para persistir entre recarregamentos.
