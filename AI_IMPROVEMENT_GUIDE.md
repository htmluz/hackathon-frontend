# Guia de Melhoria com IA - Iniciativas

## 📋 O que foi implementado

Implementamos um sistema de **guia sutil** para melhorar descrições de iniciativas usando IA, seguindo a abordagem de UX não-intrusiva.

## 🎯 Fluxo de Uso

### 1. Escrita Livre
- Usuário escreve livremente no campo "Descrição Detalhada"
- Placeholder com exemplo real ajuda a orientar
- Dica visual sutil abaixo do campo (fundo roxo claro)

### 2. Melhoria com IA
- Botão "✨ Melhorar com IA" no canto superior direito do campo
- Só fica habilitado quando há texto
- Mostra loading durante processamento

### 3. Comparação Lado a Lado
- Modal abre com duas colunas:
  - **Esquerda**: Texto original (fundo cinza)
  - **Direita**: Versão melhorada pela IA (fundo roxo/azul gradiente)
- Visual claro para comparação

### 4. Decisão do Usuário
- **"Manter Original"**: Fecha modal, mantém texto original
- **"Usar Sugestão"**: Substitui o texto no campo principal
- Usuário pode continuar editando após aceitar

## 🤖 Prompt da IA

O prompt foi otimizado para:
- ✅ Estruturar informações em seções claras (Objetivo, Problema, Impacto, etc.)
- ✅ Manter nomes de sistemas internos sem tentar explicá-los
- ✅ Preservar dados quantitativos mencionados
- ✅ Não inventar informações não fornecidas
- ✅ Usar linguagem corporativa simples
- ✅ Formato com ícones e quebras de linha (mas texto corrido dentro das seções)

### Seções geradas pela IA:
- 🎯 **OBJETIVO** - O que se quer alcançar
- 📋 **PROBLEMA ATUAL** - Cenário atual e limitações
- 👥 **IMPACTO** - Quem será afetado
- 💡 **BENEFÍCIOS ESPERADOS** - Ganhos esperados
- 🧩 **ESCOPO** - O que está incluído/excluído
- ⚠️ **PONTOS DE ATENÇÃO** - Riscos e dependências (se houver)
- 📊 **DADOS RELEVANTES** - Métricas mencionadas (se houver)

## 🎨 Design

### Cores e Estilo
- **Roxo/Azul**: Representa IA e tecnologia
- **Gradientes sutis**: Modernidade sem exagero
- **Ícone Sparkles (✨)**: Universalmente reconhecido como "IA/mágica"

### Responsividade
- Modal de comparação: 1400px de largura
- Grid de 2 colunas em telas grandes
- Altura: 85vh para boa visualização

## 💡 Vantagens desta Abordagem

1. **Não-intrusivo**: Usuário escreve livremente primeiro
2. **Controle total**: Pode aceitar, rejeitar ou editar
3. **Transparência**: Vê exatamente o que mudou
4. **Flexibilidade**: Pode usar ou não a IA
5. **Educativo**: Aprende com as sugestões da IA

## 🔧 Próximos Passos (Opcionais)

- [ ] Adicionar histórico de versões (original vs melhorada)
- [ ] Permitir edição inline no modal de comparação
- [ ] Adicionar botão "Tentar novamente" se não gostar do resultado
- [ ] Salvar preferência do usuário (sempre usar IA / nunca usar)
- [ ] Analytics: quantos usuários usam a feature de IA

## 📝 Exemplo de Uso

**Entrada do usuário:**
```
Preciso automatizar o processo de admissão que hoje é manual
```

**Saída da IA:**
```
🎯 OBJETIVO
Automatizar o processo de admissão de colaboradores para reduzir trabalho manual e agilizar a integração.

📋 PROBLEMA ATUAL
Atualmente o processo de admissão é realizado de forma manual, demandando tempo da equipe e podendo gerar inconsistências.

👥 IMPACTO
Setor de Recursos Humanos e novos colaboradores em processo de admissão.

💡 BENEFÍCIOS ESPERADOS
Redução de tempo no processo de admissão, diminuição de erros manuais, padronização do fluxo e melhor experiência para novos colaboradores.

Revise as informações acima e ajuste o que for necessário antes de enviar para análise da TIC.
```
