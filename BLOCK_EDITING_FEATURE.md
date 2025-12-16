# 🎨 Feature: Edição por Blocos com IA

## 🎯 Objetivo

Permitir que usuários refinem seções específicas da descrição melhorada pela IA, sem precisar reescrever tudo.

## 🚀 Como Usar

### 1️⃣ Gere a Versão Melhorada
- Escreva sua descrição no campo "Descrição Detalhada"
- Clique em "✨ Melhorar com IA"
- Aguarde o processamento

### 2️⃣ Visualize os Blocos
O modal de comparação abre mostrando:
- **Esquerda**: Seu texto original
- **Direita**: Versão melhorada dividida em blocos editáveis

Cada bloco tem:
- 🎯 Ícone identificador
- **Título da seção**
- Conteúdo estruturado
- Botão ✏️ (aparece ao passar o mouse)

### 3️⃣ Revise Cada Bloco
1. Leia o conteúdo de cada bloco
2. Clique no checkbox (⭕) para marcar como revisado
3. O bloco fica com borda verde quando revisado ✅

### 4️⃣ Refine um Bloco (Opcional)
1. Passe o mouse sobre o bloco que quer ajustar
2. Clique no botão ✏️ que aparece no canto
3. No mini-modal, descreva o ajuste desejado
4. Clique em "Refinar Bloco"
5. Marque o bloco como revisado novamente

### 5️⃣ Aceite a Sugestão
- Revise TODOS os blocos (obrigatório)
- Contador mostra progresso: "X de Y blocos revisados"
- Botão "Usar Sugestão" só fica habilitado quando todos estiverem revisados
- Clique para aplicar ao formulário

## 💡 Exemplos de Prompts de Refinamento

### Para o bloco 🎯 OBJETIVO
- "Seja mais específico sobre o resultado esperado"
- "Adicione prazo desejado"
- "Torne mais ambicioso"

### Para o bloco 📋 PROBLEMA ATUAL
- "Adicione dados quantitativos do problema"
- "Inclua impacto financeiro atual"
- "Mencione tentativas anteriores de solução"

### Para o bloco 👥 IMPACTO
- "Liste todos os setores afetados"
- "Quantifique o número de usuários impactados"
- "Adicione impacto em clientes externos"

### Para o bloco 💡 BENEFÍCIOS ESPERADOS
- "Adicione métricas quantitativas"
- "Inclua ROI estimado"
- "Seja mais específico sobre ganhos de tempo"

### Para o bloco 🧩 ESCOPO
- "Adicione mais itens ao escopo"
- "Seja mais claro sobre o que NÃO está incluído"
- "Divida em fases"

### Para o bloco ⚠️ PONTOS DE ATENÇÃO
- "Adicione riscos técnicos"
- "Mencione dependências de outras áreas"
- "Inclua requisitos regulatórios"

### Para o bloco 📊 DADOS RELEVANTES
- "Adicione mais métricas atuais"
- "Inclua comparação com benchmarks"
- "Adicione projeções futuras"

## 🎨 Design e UX

### Visual
- **Blocos com hover**: Efeito visual sutil ao passar o mouse
- **Botão discreto**: Aparece apenas no hover para não poluir
- **Cores**: 
  - Não revisado: Fundo branco/50 com borda cinza
  - Revisado: Fundo verde/30 com borda verde
  - Hover: Borda muda para primary
- **Ícones grandes**: 2xl para fácil identificação
- **Checkboxes**: Sempre visíveis, mudam de ⭕ para ✅
- **Contador**: Footer mostra progresso de revisão

### Interação
- **Não-intrusivo**: Botão só aparece quando necessário
- **Contextual**: Mini-modal mostra o conteúdo atual
- **Feedback visual**: Loading state durante refinamento
- **Reversível**: Pode cancelar a qualquer momento

## ✅ Sistema de Revisão Obrigatória

### Objetivo
Garantir que o usuário leia e valide cada bloco antes de aceitar a sugestão da IA.

### Implementação
```typescript
// Estado de blocos revisados
const [reviewedBlocks, setReviewedBlocks] = useState<Set<number>>(new Set());

// Toggle de revisão
const toggleBlockReview = (index: number) => {
    setReviewedBlocks(prev => {
        const newSet = new Set(prev);
        if (newSet.has(index)) {
            newSet.delete(index);
        } else {
            newSet.add(index);
        }
        return newSet;
    });
};

// Validação
const allBlocksReviewed = parsedBlocks.length > 0 && reviewedBlocks.size === parsedBlocks.length;
```

### UX
- **Checkbox sempre visível**: Não precisa hover
- **Feedback imediato**: Bloco muda de cor ao ser marcado
- **Progresso claro**: Contador no footer
- **Botão bloqueado**: Não pode aceitar sem revisar tudo
- **Tooltip explicativo**: Usuário entende por que está bloqueado

### Benefícios
- ✅ Reduz erros de submissão
- ✅ Aumenta qualidade das iniciativas
- ✅ Educa o usuário sobre estrutura esperada
- ✅ Diminui devoluções por falta de informação

## 🔧 Implementação Técnica

### Parser de Blocos
```typescript
const blockRegex = /(🎯|📋|👥|💡|🧩|⚠️|📊)\s*([A-ZÇÃÕÁÉÍÓÚ\s]+)\n([\s\S]*?)(?=\n(?:🎯|📋|👥|💡|🧩|⚠️|📊)|$)/gi;
```

Identifica:
- Ícone do bloco
- Título (em maiúsculas)
- Conteúdo (até o próximo bloco ou fim do texto)

### Fluxo de Refinamento
1. Usuário clica em editar bloco X
2. Modal abre com textarea para prompt
3. Prompt é enviado para IA junto com contexto do bloco
4. IA retorna bloco refinado
5. Array de blocos é atualizado
6. Texto completo é reconstruído
7. Modal de edição fecha

### Prompt de Refinamento
```
Você é um assistente de refinamento de texto.
O usuário tem o seguinte bloco e quer fazer um ajuste específico.

BLOCO ATUAL:
[bloco original]

SOLICITAÇÃO DO USUÁRIO:
[prompt do usuário]

INSTRUÇÕES:
- Mantenha o formato: ícone + título
- Ajuste APENAS o conteúdo conforme solicitado
- Mantenha linguagem corporativa
- Não adicione Markdown
```

## 📊 Métricas de Sucesso

- % de usuários que usam edição de blocos
- Número médio de blocos editados por iniciativa
- Tempo economizado vs reescrita completa
- Taxa de satisfação com refinamentos

## 🐛 Tratamento de Erros

- Se o parsing falhar, mostra texto completo sem blocos
- Se refinamento falhar, mantém bloco original
- Mensagens de erro claras e acionáveis
- Loading states em todas operações assíncronas

## 🎓 Aprendizados

### O que funciona bem
- ✅ Edição granular é mais rápida que reescrever tudo
- ✅ Usuários gostam de controle fino
- ✅ Hover para mostrar botão é intuitivo
- ✅ Ver conteúdo atual ajuda a formular prompt

### Possíveis Melhorias
- [ ] Histórico de versões do bloco
- [ ] Sugestões de prompts comuns
- [ ] Comparação antes/depois do refinamento
- [ ] Desfazer última edição
- [ ] Copiar bloco para clipboard
