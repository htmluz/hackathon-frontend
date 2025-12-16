package module_impl

import (
	"encoding/json"
	"hackathon-backend/domain/entities"
	"hackathon-backend/domain/usecases"
	contextutil "hackathon-backend/utils/context"
	"hackathon-backend/utils/http_error"
	"net/http"

	"github.com/gorilla/mux"
)

type AIModule struct {
	aiUseCase usecases.AIUseCase
}

func NewAIModule(aiUseCase usecases.AIUseCase) *AIModule {
	return &AIModule{
		aiUseCase: aiUseCase,
	}
}

func (m *AIModule) RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/ai/process-text", m.ProcessText).Methods("POST")
}

func (m *AIModule) ProcessText(w http.ResponseWriter, r *http.Request) {
	user, ok := contextutil.GetUserFromContext(r.Context())
	if !ok {
		http_error.Unauthorized(w, "Usuário não autenticado")
		return
	}

	var req entities.AIRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http_error.BadRequest(w, "Payload inválido")
		return
	}

	result, err := m.aiUseCase.ProcessText(r.Context(), &req, user.ID)
	if err != nil {
		http_error.BadRequest(w, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    result,
	})
}
package module_impl

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/gorilla/securecookie"
	"hackathon-backend/domain/entities"
	"hackathon-backend/domain/usecases"
	"hackathon-backend/settings_loader"
	contextutil "hackathon-backend/utils/context"
	"hackathon-backend/utils/http_error"
	"net/http"
	"time"
)

type AuthModule struct {
	authUseCase usecases.AuthUseCase
	settings    *settings_loader.SettingsLoader
}

func NewAuthModule(authUseCase usecases.AuthUseCase, settings *settings_loader.SettingsLoader) *AuthModule {
	return &AuthModule{
		authUseCase: authUseCase,
		settings:    settings,
	}
}

func (m *AuthModule) RegisterPublicRoutes(router *mux.Router) {
	router.HandleFunc("/login", m.Login).Methods("POST")
	router.HandleFunc("/logout", m.Logout).Methods("POST")
}

func (m *AuthModule) RegisterPrivateRoutes(router *mux.Router) {
	router.HandleFunc("/me", m.GetCurrentUser).Methods("GET")
}

func (m *AuthModule) Login(w http.ResponseWriter, r *http.Request) {
	var req entities.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http_error.BadRequest(w, "Payload inválido")
		return
	}

	// Validar campos obrigatórios
	if req.Email == "" || req.Password == "" {
		http_error.BadRequest(w, "Email e senha são obrigatórios")
		return
	}

	// Executar login
	user, _, err := m.authUseCase.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		http_error.Unauthorized(w, err.Error())
		return
	}

	// Criar cookie seguro
	sc := securecookie.New([]byte(m.settings.Security.CookieEncryptionKey), nil)
	encoded, err := sc.Encode("auth_token", user.ID)
	if err != nil {
		http_error.InternalServerError(w, "Erro ao criar sessão")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "auth_token",
		Value:    encoded,
		Path:     "/",
		Domain:   m.settings.Security.CookieDomain,
		Expires:  time.Now().Add(24 * time.Hour),
		Secure:   m.settings.Security.CookieSecure,
		HttpOnly: m.settings.Security.CookieHTTPOnly,
		SameSite: http.SameSiteLaxMode,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"user":    user,
	})
}

func (m *AuthModule) Logout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "auth_token",
		Value:    "",
		Path:     "/",
		Domain:   m.settings.Security.CookieDomain,
		Expires:  time.Now().Add(-1 * time.Hour),
		MaxAge:   -1,
		Secure:   m.settings.Security.CookieSecure,
		HttpOnly: m.settings.Security.CookieHTTPOnly,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Logout realizado com sucesso",
	})
}

func (m *AuthModule) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	user, ok := contextutil.GetUserFromContext(r.Context())
	if !ok {
		http_error.Unauthorized(w, "Usuário não autenticado")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"user":    user,
	})
}
package module_impl

import (
	"encoding/json"
	"hackathon-backend/domain/entities"
	"hackathon-backend/domain/usecases"
	contextutil "hackathon-backend/utils/context"
	"hackathon-backend/utils/http_error"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type CommentModule struct {
	commentUseCase usecases.CommentUseCase
}

func NewCommentModule(commentUseCase usecases.CommentUseCase) *CommentModule {
	return &CommentModule{
		commentUseCase: commentUseCase,
	}
}

func (m *CommentModule) RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/initiatives/{initiativeId}/comments", m.CreateComment).Methods("POST")
	router.HandleFunc("/initiatives/{initiativeId}/comments", m.ListComments).Methods("GET")
	router.HandleFunc("/comments/{id}", m.UpdateComment).Methods("PUT")
	router.HandleFunc("/comments/{id}", m.DeleteComment).Methods("DELETE")
}

func (m *CommentModule) CreateComment(w http.ResponseWriter, r *http.Request) {
	user, ok := contextutil.GetUserFromContext(r.Context())
	if !ok {
		http_error.Unauthorized(w, "Usuário não autenticado")
		return
	}

	vars := mux.Vars(r)
	initiativeID, err := strconv.ParseInt(vars["initiativeId"], 10, 64)
	if err != nil {
		http_error.BadRequest(w, "ID de iniciativa inválido")
		return
	}

	var req entities.CreateCommentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http_error.BadRequest(w, "Payload inválido")
		return
	}

	comment, err := m.commentUseCase.CreateComment(r.Context(), initiativeID, &req, user.ID)
	if err != nil {
		http_error.BadRequest(w, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Comentário criado com sucesso",
		"data":    comment,
	})
}

func (m *CommentModule) ListComments(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	initiativeID, err := strconv.ParseInt(vars["initiativeId"], 10, 64)
	if err != nil {
		http_error.BadRequest(w, "ID de iniciativa inválido")
		return
	}

	comments, err := m.commentUseCase.ListComments(r.Context(), initiativeID)
	if err != nil {
		http_error.InternalServerError(w, "Erro ao listar comentários")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    comments,
		"count":   len(comments),
	})
}

func (m *CommentModule) UpdateComment(w http.ResponseWriter, r *http.Request) {
	user, ok := contextutil.GetUserFromContext(r.Context())
	if !ok {
		http_error.Unauthorized(w, "Usuário não autenticado")
		return
	}

	vars := mux.Vars(r)
	commentID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http_error.BadRequest(w, "ID de comentário inválido")
		return
	}

	var req entities.UpdateCommentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http_error.BadRequest(w, "Payload inválido")
		return
	}

	comment, err := m.commentUseCase.UpdateComment(r.Context(), commentID, &req, user.ID)
	if err != nil {
		http_error.BadRequest(w, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Comentário atualizado com sucesso",
		"data":    comment,
	})
}

func (m *CommentModule) DeleteComment(w http.ResponseWriter, r *http.Request) {
	user, ok := contextutil.GetUserFromContext(r.Context())
	if !ok {
		http_error.Unauthorized(w, "Usuário não autenticado")
		return
	}

	vars := mux.Vars(r)
	commentID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http_error.BadRequest(w, "ID de comentário inválido")
		return
	}

	if err := m.commentUseCase.DeleteComment(r.Context(), commentID, user.ID); err != nil {
		http_error.BadRequest(w, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Comentário deletado com sucesso",
	})
}
package module_impl

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/mux"
)

type HealthModule struct{}

func NewHealthModule() *HealthModule {
	return &HealthModule{}
}

func (m *HealthModule) RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/health", m.HealthCheck).Methods("GET")
}

func (m *HealthModule) HealthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":    "ok",
		"timestamp": time.Now().Format(time.RFC3339),
	})
}
package module_impl

import (
	"encoding/json"
	"fmt"
	"hackathon-backend/domain/entities"
	"hackathon-backend/domain/usecases"
	contextutil "hackathon-backend/utils/context"
	"hackathon-backend/utils/http_error"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type InitiativeModule struct {
	initiativeUseCase        usecases.InitiativeUseCase
	initiativeHistoryUseCase usecases.InitiativeHistoryUseCase
	cancellationUseCase      usecases.CancellationUseCase
}

func NewInitiativeModule(
	initiativeUseCase usecases.InitiativeUseCase,
	historyUseCase usecases.InitiativeHistoryUseCase,
	cancellationUseCase usecases.CancellationUseCase,
) *InitiativeModule {
	return &InitiativeModule{
		initiativeUseCase:        initiativeUseCase,
		initiativeHistoryUseCase: historyUseCase,
		cancellationUseCase:      cancellationUseCase,
	}
}

func (m *InitiativeModule) RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/initiatives", m.CreateInitiative).Methods("POST")
	router.HandleFunc("/initiatives", m.ListInitiatives).Methods("GET")
	router.HandleFunc("/initiatives/submitted", m.ListSubmittedInitiatives).Methods("GET") // NOVO
	router.HandleFunc("/initiatives/{id}", m.GetInitiative).Methods("GET")
	router.HandleFunc("/initiatives/{id}", m.UpdateInitiative).Methods("PUT")
	router.HandleFunc("/initiatives/{id}", m.DeleteInitiative).Methods("DELETE")
	router.HandleFunc("/initiatives/{id}/status", m.ChangeStatus).Methods("PATCH")
	router.HandleFunc("/initiatives/{id}/review", m.ReviewInitiative).Methods("POST") // NOVO
	router.HandleFunc("/initiatives/{id}/history", m.GetHistory).Methods("GET")
	router.HandleFunc("/initiatives/{id}/request-cancellation", m.RequestCancellation).Methods("POST")
	router.HandleFunc("/my-initiatives", m.GetMyInitiatives).Methods("GET")

	// Rotas de gerenciamento de cancelamentos
	router.HandleFunc("/cancellation-requests", m.ListPendingCancellations).Methods("GET")
	router.HandleFunc("/cancellation-requests/{id}/review", m.ReviewCancellation).Methods("POST")
}

func (m *InitiativeModule) CreateInitiative(w http.ResponseWriter, r *http.Request) {
	user, ok := contextutil.GetUserFromContext(r.Context())
	if !ok {
		http_error.Unauthorized(w, "Usuário não autenticado")
		return
	}

	var req entities.CreateInitiativeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http_error.BadRequest(w, "Payload inválido")
		return
	}

	initiative, err := m.initiativeUseCase.CreateInitiative(r.Context(), &req, user.ID)
	if err != nil {
		http_error.BadRequest(w, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Iniciativa criada com sucesso e enviada para aprovação",
		"data":    initiative,
	})
}

func (m *InitiativeModule) ListInitiatives(w http.ResponseWriter, r *http.Request) {
	// NOVO: Pegar usuário autenticado
	user, ok := contextutil.GetUserFromContext(r.Context())
	if !ok {
		http_error.Unauthorized(w, "Usuário não autenticado")
		return
	}

	// Parse query params para filtros
	filter := &entities.InitiativeFilter{
		Search:   r.URL.Query().Get("search"),
		Status:   r.URL.Query().Get("status"),
		Type:     r.URL.Query().Get("type"),
		Sector:   r.URL.Query().Get("sector"),
		Priority: r.URL.Query().Get("priority"),
	}

	// NOVO: Passar userID para aplicar filtro de setor
	initiatives, err := m.initiativeUseCase.ListInitiatives(r.Context(), filter, user.ID)
	if err != nil {
		http_error.InternalServerError(w, "Erro ao listar iniciativas")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    initiatives,
		"count":   len(initiatives),
	})
}

// NOVO: Listar iniciativas submetidas (para aprovação)
func (m *InitiativeModule) ListSubmittedInitiatives(w http.ResponseWriter, r *http.Request) {
	user, ok := contextutil.GetUserFromContext(r.Context())
	if !ok {
		http_error.Unauthorized(w, "Usuário não autenticado")
		return
	}

	initiatives, err := m.initiativeUseCase.ListSubmittedInitiatives(r.Context(), user.ID)
	if err != nil {
		http_error.Forbidden(w, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    initiatives,
		"count":   len(initiatives),
	})
}

// NOVO: Aprovar ou reprovar iniciativa
func (m *InitiativeModule) ReviewInitiative(w http.ResponseWriter, r *http.Request) {
	user, ok := contextutil.GetUserFromContext(r.Context())
	if !ok {
		http_error.Unauthorized(w, "Usuário não autenticado")
		return
	}

	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http_error.BadRequest(w, "ID inválido")
		return
	}

	var req entities.ReviewInitiativeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http_error.BadRequest(w, "Payload inválido")
		return
	}

	if err := m.initiativeUseCase.ReviewInitiative(r.Context(), id, &req, user.ID); err != nil {
		http_error.BadRequest(w, err.Error())
		return
	}

	// CORRIGIDO: mensagem agora diz "aprovada" ao invés de "movida para análise"
	action := "reprovada"
	if req.Approved {
		action = "aprovada"
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": fmt.Sprintf("Iniciativa %s com sucesso", action),
	})
}

func (m *InitiativeModule) GetInitiative(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http_error.BadRequest(w, "ID inválido")
		return
	}

	initiative, err := m.initiativeUseCase.GetInitiativeByID(r.Context(), id)
	if err != nil {
		http_error.NotFound(w, "Iniciativa não encontrada")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    initiative,
	})
}

func (m *InitiativeModule) UpdateInitiative(w http.ResponseWriter, r *http.Request) {
	user, ok := contextutil.GetUserFromContext(r.Context())
	if !ok {
		http_error.Unauthorized(w, "Usuário não autenticado")
		return
	}

	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http_error.BadRequest(w, "ID inválido")
		return
	}

	var req entities.UpdateInitiativeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http_error.BadRequest(w, "Payload inválido")
		return
	}

	initiative, err := m.initiativeUseCase.UpdateInitiative(r.Context(), id, &req, user.ID)
	if err != nil {
		http_error.BadRequest(w, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Iniciativa atualizada com sucesso",
		"data":    initiative,
	})
}

func (m *InitiativeModule) DeleteInitiative(w http.ResponseWriter, r *http.Request) {
	user, ok := contextutil.GetUserFromContext(r.Context())
	if !ok {
		http_error.Unauthorized(w, "Usuário não autenticado")
		return
	}

	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http_error.BadRequest(w, "ID inválido")
		return
	}

	if err := m.initiativeUseCase.DeleteInitiative(r.Context(), id, user.ID); err != nil {
		http_error.BadRequest(w, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Iniciativa deletada com sucesso",
	})
}

func (m *InitiativeModule) ChangeStatus(w http.ResponseWriter, r *http.Request) {
	user, ok := contextutil.GetUserFromContext(r.Context())
	if !ok {
		http_error.Unauthorized(w, "Usuário não autenticado")
		return
	}

	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http_error.BadRequest(w, "ID inválido")
		return
	}

	var req entities.ChangeInitiativeStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http_error.BadRequest(w, "Payload inválido")
		return
	}

	if err := m.initiativeUseCase.ChangeStatus(r.Context(), id, &req, user.ID); err != nil {
		http_error.BadRequest(w, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Status alterado com sucesso",
	})
}

func (m *InitiativeModule) GetMyInitiatives(w http.ResponseWriter, r *http.Request) {
	user, ok := contextutil.GetUserFromContext(r.Context())
	if !ok {
		http_error.Unauthorized(w, "Usuário não autenticado")
		return
	}

	initiatives, err := m.initiativeUseCase.GetMyInitiatives(r.Context(), user.ID)
	if err != nil {
		http_error.InternalServerError(w, "Erro ao buscar suas iniciativas")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    initiatives,
		"count":   len(initiatives),
	})
}

func (m *InitiativeModule) GetHistory(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http_error.BadRequest(w, "ID inválido")
		return
	}

	history, err := m.initiativeHistoryUseCase.GetHistory(r.Context(), id)
	if err != nil {
		http_error.InternalServerError(w, "Erro ao buscar histórico")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    history,
		"count":   len(history),
	})
}

func (m *InitiativeModule) RequestCancellation(w http.ResponseWriter, r *http.Request) {
	user, ok := contextutil.GetUserFromContext(r.Context())
	if !ok {
		http_error.Unauthorized(w, "Usuário não autenticado")
		return
	}

	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http_error.BadRequest(w, "ID inválido")
		return
	}

	var req entities.RequestCancellationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http_error.BadRequest(w, "Payload inválido")
		return
	}

	cancellationReq, err := m.cancellationUseCase.RequestCancellation(r.Context(), id, &req, user.ID)
	if err != nil {
		http_error.BadRequest(w, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Solicitação de cancelamento criada com sucesso",
		"data":    cancellationReq,
	})
}

func (m *InitiativeModule) ListPendingCancellations(w http.ResponseWriter, r *http.Request) {
	user, ok := contextutil.GetUserFromContext(r.Context())
	if !ok {
		http_error.Unauthorized(w, "Usuário não autenticado")
		return
	}

	requests, err := m.cancellationUseCase.ListPendingCancellations(r.Context(), user.ID)
	if err != nil {
		http_error.Forbidden(w, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    requests,
		"count":   len(requests),
	})
}

func (m *InitiativeModule) ReviewCancellation(w http.ResponseWriter, r *http.Request) {
	user, ok := contextutil.GetUserFromContext(r.Context())
	if !ok {
		http_error.Unauthorized(w, "Usuário não autenticado")
		return
	}

	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http_error.BadRequest(w, "ID inválido")
		return
	}

	var req entities.ReviewCancellationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http_error.BadRequest(w, "Payload inválido")
		return
	}

	if err := m.cancellationUseCase.ReviewCancellation(r.Context(), id, &req, user.ID); err != nil {
		http_error.BadRequest(w, err.Error())
		return
	}

	action := "reprovada"
	if req.Approved {
		action = "aprovada e a iniciativa foi cancelada"
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": fmt.Sprintf("Solicitação de cancelamento %s", action),
	})
}
package module_impl

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"hackathon-backend/domain/usecases"
	contextutil "hackathon-backend/utils/context"
	"hackathon-backend/utils/http_error"
	"net/http"
	"strconv"
)

type PermissionModule struct {
	permUseCase usecases.PermissionUseCase
}

func NewPermissionModule(permUseCase usecases.PermissionUseCase) *PermissionModule {
	return &PermissionModule{
		permUseCase: permUseCase,
	}
}

func (m *PermissionModule) RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/personal-information", m.GetPersonalInformation).Methods("GET")
	router.HandleFunc("/user-types", m.GetAllUserTypes).Methods("GET") // NOVO
	router.HandleFunc("/admin/users/{userId}/types/{typeId}", m.AssignUserType).Methods("POST")
	router.HandleFunc("/admin/users/{userId}/types/{typeId}", m.RemoveUserType).Methods("DELETE")
}

func (m *PermissionModule) GetPersonalInformation(w http.ResponseWriter, r *http.Request) {
	user, ok := contextutil.GetUserFromContext(r.Context())
	if !ok {
		http_error.Unauthorized(w, "Usuário não autenticado")
		return
	}

	personalInfo, err := m.permUseCase.GetPersonalInformation(r.Context(), user.ID)
	if err != nil {
		http_error.InternalServerError(w, "Erro ao buscar informações pessoais")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    personalInfo,
	})
}

// NOVO: Endpoint para listar todos os tipos disponíveis
func (m *PermissionModule) GetAllUserTypes(w http.ResponseWriter, r *http.Request) {
	userTypes, err := m.permUseCase.GetAllUserTypes(r.Context())
	if err != nil {
		http_error.InternalServerError(w, "Erro ao buscar tipos de usuário")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    userTypes,
	})
}

func (m *PermissionModule) AssignUserType(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err := strconv.ParseInt(vars["userId"], 10, 64)
	if err != nil {
		http_error.BadRequest(w, "ID de usuário inválido")
		return
	}

	typeID, err := strconv.ParseInt(vars["typeId"], 10, 64)
	if err != nil {
		http_error.BadRequest(w, "ID de tipo inválido")
		return
	}

	if err := m.permUseCase.AssignUserType(r.Context(), userID, typeID); err != nil {
		http_error.InternalServerError(w, "Erro ao atribuir tipo ao usuário")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Tipo atribuído com sucesso",
	})
}

func (m *PermissionModule) RemoveUserType(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err := strconv.ParseInt(vars["userId"], 10, 64)
	if err != nil {
		http_error.BadRequest(w, "ID de usuário inválido")
		return
	}

	typeID, err := strconv.ParseInt(vars["typeId"], 10, 64)
	if err != nil {
		http_error.BadRequest(w, "ID de tipo inválido")
		return
	}

	if err := m.permUseCase.RemoveUserType(r.Context(), userID, typeID); err != nil {
		http_error.InternalServerError(w, "Erro ao remover tipo do usuário")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Tipo removido com sucesso",
	})
}
package module_impl

import (
	"encoding/json"
	"hackathon-backend/domain/entities"
	"hackathon-backend/domain/usecases"
	"hackathon-backend/utils/http_error"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type SectorModule struct {
	sectorUseCase usecases.SectorUseCase
}

func NewSectorModule(sectorUseCase usecases.SectorUseCase) *SectorModule {
	return &SectorModule{
		sectorUseCase: sectorUseCase,
	}
}

func (m *SectorModule) RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/sectors", m.CreateSector).Methods("POST")
	router.HandleFunc("/sectors", m.ListSectors).Methods("GET")
	router.HandleFunc("/sectors/{id}", m.GetSector).Methods("GET")
	router.HandleFunc("/sectors/{id}", m.UpdateSector).Methods("PUT")
	router.HandleFunc("/sectors/{id}", m.DeleteSector).Methods("DELETE")
}

func (m *SectorModule) CreateSector(w http.ResponseWriter, r *http.Request) {
	var req entities.CreateSectorRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http_error.BadRequest(w, "Payload inválido")
		return
	}

	sector, err := m.sectorUseCase.CreateSector(r.Context(), &req)
	if err != nil {
		http_error.BadRequest(w, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Setor criado com sucesso",
		"data":    sector,
	})
}

func (m *SectorModule) ListSectors(w http.ResponseWriter, r *http.Request) {
	// Query param para filtrar apenas ativos
	activeOnly := r.URL.Query().Get("active_only") == "true"

	sectors, err := m.sectorUseCase.ListSectors(r.Context(), activeOnly)
	if err != nil {
		http_error.InternalServerError(w, "Erro ao listar setores")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    sectors,
		"count":   len(sectors),
	})
}

func (m *SectorModule) GetSector(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	sectorID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http_error.BadRequest(w, "ID inválido")
		return
	}

	sector, err := m.sectorUseCase.GetSectorByID(r.Context(), sectorID)
	if err != nil {
		http_error.NotFound(w, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    sector,
	})
}

func (m *SectorModule) UpdateSector(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	sectorID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http_error.BadRequest(w, "ID inválido")
		return
	}

	var req entities.UpdateSectorRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http_error.BadRequest(w, "Payload inválido")
		return
	}

	sector, err := m.sectorUseCase.UpdateSector(r.Context(), sectorID, &req)
	if err != nil {
		http_error.BadRequest(w, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Setor atualizado com sucesso",
		"data":    sector,
	})
}

func (m *SectorModule) DeleteSector(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	sectorID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http_error.BadRequest(w, "ID inválido")
		return
	}

	if err := m.sectorUseCase.DeleteSector(r.Context(), sectorID); err != nil {
		http_error.BadRequest(w, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Setor deletado com sucesso",
	})
}
package module_impl

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"hackathon-backend/domain/entities"
	"hackathon-backend/domain/usecases"
	contextutil "hackathon-backend/utils/context"
	"hackathon-backend/utils/http_error"
	"net/http"
	"strconv"
)

type UserCrudModule struct {
	userCrudUseCase usecases.UserCrudUseCase
}

func NewUserCrudModule(userCrudUseCase usecases.UserCrudUseCase) *UserCrudModule {
	return &UserCrudModule{
		userCrudUseCase: userCrudUseCase,
	}
}

func (m *UserCrudModule) RegisterRoutes(router *mux.Router) {
	// Rotas protegidas para admin
	router.HandleFunc("/users", m.CreateUser).Methods("POST")
	router.HandleFunc("/users", m.ListUsers).Methods("GET")
	router.HandleFunc("/users/{id}", m.GetUser).Methods("GET")
	router.HandleFunc("/users/{id}", m.UpdateUser).Methods("PUT")
	router.HandleFunc("/users/{id}", m.DeleteUser).Methods("DELETE")

	// Rota para qualquer usuário autenticado mudar sua própria senha
	router.HandleFunc("/change-password", m.ChangePassword).Methods("POST")
}

func (m *UserCrudModule) CreateUser(w http.ResponseWriter, r *http.Request) {
	var req entities.CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http_error.BadRequest(w, "Payload inválido")
		return
	}

	user, err := m.userCrudUseCase.CreateUser(r.Context(), &req)
	if err != nil {
		http_error.BadRequest(w, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Usuário criado com sucesso",
		"user":    user,
	})
}

func (m *UserCrudModule) ListUsers(w http.ResponseWriter, r *http.Request) {
	users, err := m.userCrudUseCase.ListUsers(r.Context())
	if err != nil {
		http_error.InternalServerError(w, "Erro ao listar usuários")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    users,
		"count":   len(users),
	})
}

func (m *UserCrudModule) GetUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http_error.BadRequest(w, "ID inválido")
		return
	}

	user, err := m.userCrudUseCase.GetUserByID(r.Context(), userID)
	if err != nil {
		http_error.NotFound(w, "Usuário não encontrado")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"user":    user,
	})
}

func (m *UserCrudModule) UpdateUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http_error.BadRequest(w, "ID inválido")
		return
	}

	var req entities.UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http_error.BadRequest(w, "Payload inválido")
		return
	}

	user, err := m.userCrudUseCase.UpdateUser(r.Context(), userID, &req)
	if err != nil {
		http_error.BadRequest(w, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Usuário atualizado com sucesso",
		"user":    user,
	})
}

func (m *UserCrudModule) DeleteUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http_error.BadRequest(w, "ID inválido")
		return
	}

	// Impedir que o usuário delete a si mesmo
	currentUser, ok := contextutil.GetUserFromContext(r.Context())
	if !ok {
		http_error.Unauthorized(w, "Usuário não autenticado")
		return
	}

	if currentUser.ID == userID {
		http_error.BadRequest(w, "Você não pode deletar sua própria conta")
		return
	}

	if err := m.userCrudUseCase.DeleteUser(r.Context(), userID); err != nil {
		http_error.BadRequest(w, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Usuário deletado com sucesso",
	})
}

func (m *UserCrudModule) ChangePassword(w http.ResponseWriter, r *http.Request) {
	currentUser, ok := contextutil.GetUserFromContext(r.Context())
	if !ok {
		http_error.Unauthorized(w, "Usuário não autenticado")
		return
	}

	var req entities.ChangePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http_error.BadRequest(w, "Payload inválido")
		return
	}

	if err := m.userCrudUseCase.ChangePassword(r.Context(), currentUser.ID, &req); err != nil {
		http_error.BadRequest(w, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Senha alterada com sucesso",
	})
}


reositorys

package repository_impl

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"hackathon-backend/domain/entities"
	"hackathon-backend/settings_loader"
	"net/http"
	"time"
)

type AIRepositoryImpl struct {
	settings *settings_loader.SettingsLoader
	client   *http.Client
}

func NewAIRepositoryImpl(settings *settings_loader.SettingsLoader) *AIRepositoryImpl {
	timeout := time.Duration(settings.GetAIRequestTimeout()) * time.Second

	// Configure HTTP client with TLS settings
	// Note: InsecureSkipVerify is set to true for development
	// In production, ensure proper CA certificates are installed
	transport := &http.Transport{
		TLSClientConfig: &tls.Config{
			InsecureSkipVerify: true,
		},
	}

	return &AIRepositoryImpl{
		settings: settings,
		client: &http.Client{
			Timeout:   timeout,
			Transport: transport,
		},
	}
}

// Estruturas para comunicação com a API Gemini
type geminiRequest struct {
	Contents []geminiContent `json:"contents"`
	GenerationConfig geminiGenerationConfig `json:"generationConfig"`
}

type geminiContent struct {
	Parts []geminiPart `json:"parts"`
}

type geminiPart struct {
	Text string `json:"text"`
}

type geminiGenerationConfig struct {
	Temperature float64 `json:"temperature"`
	MaxOutputTokens int `json:"maxOutputTokens"`
}

type geminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
	Error *struct {
		Message string `json:"message"`
		Code    int    `json:"code"`
	} `json:"error,omitempty"`
}

func (r *AIRepositoryImpl) ProcessText(ctx context.Context, req *entities.AIRequest) (*entities.AIResponse, error) {
	// Verificar se IA está habilitada
	if !r.settings.IsAIEnabled() {
		return nil, errors.New("funcionalidade de IA não está habilitada. Configure ai.gemini_api_key no settings.toml")
	}

	// Validações
	if req.Text == "" {
		return nil, errors.New("texto não pode estar vazio")
	}

	if req.Prompt == "" {
		return nil, errors.New("prompt não pode estar vazio")
	}

	if len(req.Text) > 10000 {
		return nil, errors.New("texto muito longo (máximo 10000 caracteres)")
	}

	// Combinar prompt com texto
	fullPrompt := fmt.Sprintf("%s\n\nTexto:\n%s", req.Prompt, req.Text)

	// Montar requisição para Gemini
	geminiReq := geminiRequest{
		Contents: []geminiContent{
			{
				Parts: []geminiPart{
					{Text: fullPrompt},
				},
			},
		},
		GenerationConfig: geminiGenerationConfig{
			Temperature: r.settings.GetAITemperature(),
			MaxOutputTokens: r.settings.GetAIMaxTokens(),
		},
	}

	payload, err := json.Marshal(geminiReq)
	if err != nil {
		return nil, fmt.Errorf("erro ao montar payload: %w", err)
	}

	// Criar requisição HTTP
	apiKey := r.settings.GetGeminiAPIKey()
	model := r.settings.GetGeminiModel()
	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent", model)

	httpReq, err := http.NewRequestWithContext(
		ctx,
		"POST",
		url,
		bytes.NewReader(payload),
	)
	if err != nil {
		return nil, fmt.Errorf("erro ao criar requisição: %w", err)
	}

	httpReq.Header.Set("X-Goog-Api-Key", apiKey)
	httpReq.Header.Set("Content-Type", "application/json")

	// Executar requisição
	resp, err := r.client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("erro ao chamar API Gemini: %w", err)
	}
	defer resp.Body.Close()

	// Parse da resposta
	var geminiResp geminiResponse
	if err := json.NewDecoder(resp.Body).Decode(&geminiResp); err != nil {
		return nil, fmt.Errorf("erro ao decodificar resposta: %w", err)
	}

	// Verificar erro na resposta
	if geminiResp.Error != nil {
		return nil, fmt.Errorf("erro da API Gemini: %s", geminiResp.Error.Message)
	}

	// Verificar se tem candidates
	if len(geminiResp.Candidates) == 0 {
		return nil, errors.New("resposta vazia da API Gemini")
	}

	// Verificar se tem parts
	if len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return nil, errors.New("resposta sem conteúdo da API Gemini")
	}

	generatedText := geminiResp.Candidates[0].Content.Parts[0].Text

	return &entities.AIResponse{
		OriginalText: req.Text,
		GeneratedText: generatedText,
		Prompt:       req.Prompt,
		Model:        model,
	}, nil
}
package repository_impl

import (
	"context"
	"database/sql"
	"hackathon-backend/domain/entities"
)

type AuthRepositoryImpl struct {
	db *sql.DB
}

func NewAuthRepositoryImpl(db *sql.DB) *AuthRepositoryImpl {
	return &AuthRepositoryImpl{db: db}
}

func (r *AuthRepositoryImpl) GetUserByEmail(ctx context.Context, email string) (*entities.User, error) {
	query := `
		SELECT u.id, u.email, u.name, u.password, u.sector_id, u.created_at, u.updated_at
		FROM users u
		WHERE u.email = $1
	`

	user := &entities.User{}
	var sectorID sql.NullInt64

	err := r.db.QueryRowContext(ctx, query, email).Scan(
		&user.ID,
		&user.Email,
		&user.Name,
		&user.Password,
		&sectorID,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, err
		}
		return nil, err
	}

	if sectorID.Valid {
		user.SectorID = &sectorID.Int64
	}

	return user, nil
}

func (r *AuthRepositoryImpl) GetUserByID(ctx context.Context, userID int64) (*entities.User, error) {
	query := `
		SELECT u.id, u.email, u.name, u.password, u.sector_id, u.created_at, u.updated_at
		FROM users u
		WHERE u.id = $1
	`

	user := &entities.User{}
	var sectorID sql.NullInt64

	err := r.db.QueryRowContext(ctx, query, userID).Scan(
		&user.ID,
		&user.Email,
		&user.Name,
		&user.Password,
		&sectorID,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	if sectorID.Valid {
		user.SectorID = &sectorID.Int64
	}

	return user, nil
}

func (r *AuthRepositoryImpl) CreateUser(ctx context.Context, user *entities.User) error {
	query := `
		INSERT INTO users (email, name, password, sector_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	return r.db.QueryRowContext(ctx, query, user.Email, user.Name, user.Password, user.SectorID).Scan(
		&user.ID,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
}

func (r *AuthRepositoryImpl) UpdateUser(ctx context.Context, user *entities.User) error {
	query := `
		UPDATE users
		SET email = $1, name = $2, sector_id = $3, updated_at = NOW()
		WHERE id = $4
		RETURNING updated_at
	`

	return r.db.QueryRowContext(ctx, query, user.Email, user.Name, user.SectorID, user.ID).Scan(&user.UpdatedAt)
}

func (r *AuthRepositoryImpl) DeleteUser(ctx context.Context, userID int64) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, userID)
	return err
}

// ATUALIZADO: Buscar usuários com informações do setor
func (r *AuthRepositoryImpl) ListAllUsers(ctx context.Context) ([]*entities.User, error) {
	query := `
		SELECT u.id, u.email, u.name, u.password, u.sector_id, s.name as sector_name, u.created_at, u.updated_at
		FROM users u
		LEFT JOIN sectors s ON s.id = u.sector_id
		ORDER BY u.created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*entities.User
	for rows.Next() {
		user := &entities.User{}
		var sectorID sql.NullInt64
		var sectorName sql.NullString

		err := rows.Scan(
			&user.ID,
			&user.Email,
			&user.Name,
			&user.Password,
			&sectorID,
			&sectorName,
			&user.CreatedAt,
			&user.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		if sectorID.Valid {
			user.SectorID = &sectorID.Int64
		}

		if sectorName.Valid {
			user.SectorName = sectorName.String
		}

		users = append(users, user)
	}

	return users, nil
}

func (r *AuthRepositoryImpl) UpdatePassword(ctx context.Context, userID int64, hashedPassword string) error {
	query := `
		UPDATE users
		SET password = $1, updated_at = NOW()
		WHERE id = $2
	`

	_, err := r.db.ExecContext(ctx, query, hashedPassword, userID)
	return err
}

func (r *AuthRepositoryImpl) RemoveAllUserTypes(ctx context.Context, userID int64) error {
	query := `DELETE FROM type_user WHERE user_id = $1`
	_, err := r.db.ExecContext(ctx, query, userID)
	return err
}
package repository_impl

import (
	"context"
	"database/sql"
	"hackathon-backend/domain/entities"
)

type CancellationRepositoryImpl struct {
	db *sql.DB
}

func NewCancellationRepositoryImpl(db *sql.DB) *CancellationRepositoryImpl {
	return &CancellationRepositoryImpl{db: db}
}

func (r *CancellationRepositoryImpl) Create(ctx context.Context, request *entities.InitiativeCancellationRequest) error {
	query := `
		INSERT INTO initiative_cancellation_requests (initiative_id, requested_by_user_id, reason, status, created_at)
		VALUES ($1, $2, $3, $4, NOW())
		RETURNING id, created_at
	`

	return r.db.QueryRowContext(ctx, query,
		request.InitiativeID,
		request.RequestedByUserID,
		request.Reason,
		entities.CancellationStatusPending,
	).Scan(&request.ID, &request.CreatedAt)
}

func (r *CancellationRepositoryImpl) GetByID(ctx context.Context, requestID int64) (*entities.InitiativeCancellationRequest, error) {
	query := `
		SELECT cr.id, cr.initiative_id, cr.requested_by_user_id, u1.name as requested_by_name,
		       cr.reason, cr.status, cr.reviewed_by_user_id, u2.name as reviewed_by_name,
		       cr.review_reason, cr.created_at, cr.reviewed_at
		FROM initiative_cancellation_requests cr
		INNER JOIN users u1 ON u1.id = cr.requested_by_user_id
		LEFT JOIN users u2 ON u2.id = cr.reviewed_by_user_id
		WHERE cr.id = $1
	`

	req := &entities.InitiativeCancellationRequest{}
	var reviewedByUserID sql.NullInt64
	var reviewedByName, reviewReason sql.NullString
	var reviewedAt sql.NullTime

	err := r.db.QueryRowContext(ctx, query, requestID).Scan(
		&req.ID,
		&req.InitiativeID,
		&req.RequestedByUserID,
		&req.RequestedByName,
		&req.Reason,
		&req.Status,
		&reviewedByUserID,
		&reviewedByName,
		&reviewReason,
		&req.CreatedAt,
		&reviewedAt,
	)

	if err != nil {
		return nil, err
	}

	if reviewedByUserID.Valid {
		req.ReviewedByUserID = &reviewedByUserID.Int64
		req.ReviewedByName = reviewedByName.String
		req.ReviewReason = reviewReason.String
	}

	if reviewedAt.Valid {
		req.ReviewedAt = &reviewedAt.Time
	}

	return req, nil
}

func (r *CancellationRepositoryImpl) GetPendingByInitiative(ctx context.Context, initiativeID int64) (*entities.InitiativeCancellationRequest, error) {
	query := `
		SELECT cr.id, cr.initiative_id, cr.requested_by_user_id, u. name as requested_by_name,
		       cr.reason, cr.status, cr.created_at
		FROM initiative_cancellation_requests cr
		INNER JOIN users u ON u.id = cr.requested_by_user_id
		WHERE cr.initiative_id = $1 AND cr.status = $2
	`

	req := &entities.InitiativeCancellationRequest{}
	err := r.db.QueryRowContext(ctx, query, initiativeID, entities.CancellationStatusPending).Scan(
		&req.ID,
		&req.InitiativeID,
		&req.RequestedByUserID,
		&req.RequestedByName,
		&req.Reason,
		&req.Status,
		&req.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return req, nil
}

func (r *CancellationRepositoryImpl) ListPending(ctx context.Context) ([]*entities.InitiativeCancellationRequest, error) {
	query := `
		SELECT cr.id, cr.initiative_id, cr.requested_by_user_id, u.name as requested_by_name,
		       cr. reason, cr.status, cr. created_at
		FROM initiative_cancellation_requests cr
		INNER JOIN users u ON u.id = cr.requested_by_user_id
		WHERE cr.status = $1
		ORDER BY cr.created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, entities.CancellationStatusPending)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []*entities.InitiativeCancellationRequest
	for rows.Next() {
		req := &entities.InitiativeCancellationRequest{}
		err := rows.Scan(
			&req.ID,
			&req.InitiativeID,
			&req.RequestedByUserID,
			&req.RequestedByName,
			&req.Reason,
			&req.Status,
			&req.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		requests = append(requests, req)
	}

	return requests, nil
}

func (r *CancellationRepositoryImpl) UpdateStatus(ctx context.Context, requestID int64, status string, reviewedByUserID int64, reviewReason string) error {
	query := `
		UPDATE initiative_cancellation_requests
		SET status = $1, reviewed_by_user_id = $2, review_reason = $3, reviewed_at = NOW()
		WHERE id = $4
	`

	_, err := r.db.ExecContext(ctx, query, status, reviewedByUserID, reviewReason, requestID)
	return err
}

func (r *CancellationRepositoryImpl) HasPendingRequest(ctx context.Context, initiativeID int64) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM initiative_cancellation_requests WHERE initiative_id = $1 AND status = $2)`

	var exists bool
	err := r.db.QueryRowContext(ctx, query, initiativeID, entities.CancellationStatusPending).Scan(&exists)
	return exists, err
}

package repository_impl

import (
	"context"
	"database/sql"
	"hackathon-backend/domain/entities"
)

type CommentRepositoryImpl struct {
	db *sql.DB
}

func NewCommentRepositoryImpl(db *sql.DB) *CommentRepositoryImpl {
	return &CommentRepositoryImpl{db: db}
}

func (r *CommentRepositoryImpl) Create(ctx context.Context, comment *entities.Comment) error {
	query := `
		INSERT INTO initiative_comments (initiative_id, user_id, content, created_at, updated_at)
		VALUES ($1, $2, $3, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	return r.db.QueryRowContext(ctx, query,
		comment.InitiativeID,
		comment.UserID,
		comment.Content,
	).Scan(&comment.ID, &comment.CreatedAt, &comment.UpdatedAt)
}

func (r *CommentRepositoryImpl) Update(ctx context.Context, comment *entities.Comment) error {
	query := `
		UPDATE initiative_comments
		SET content = $1, updated_at = NOW()
		WHERE id = $2
		RETURNING updated_at
	`

	return r.db.QueryRowContext(ctx, query, comment.Content, comment.ID).Scan(&comment.UpdatedAt)
}

func (r *CommentRepositoryImpl) Delete(ctx context.Context, commentID int64) error {
	query := `DELETE FROM initiative_comments WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, commentID)
	return err
}

func (r *CommentRepositoryImpl) GetByID(ctx context.Context, commentID int64) (*entities.Comment, error) {
	query := `
		SELECT c.id, c.initiative_id, c.user_id, u.name as user_name, c.content, c.created_at, c.updated_at
		FROM initiative_comments c
		INNER JOIN users u ON u.id = c.user_id
		WHERE c.id = $1
	`

	comment := &entities.Comment{}
	err := r.db.QueryRowContext(ctx, query, commentID).Scan(
		&comment.ID,
		&comment.InitiativeID,
		&comment.UserID,
		&comment.UserName,
		&comment.Content,
		&comment.CreatedAt,
		&comment.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return comment, nil
}

func (r *CommentRepositoryImpl) ListByInitiative(ctx context.Context, initiativeID int64) ([]*entities.Comment, error) {
	query := `
		SELECT c.id, c.initiative_id, c.user_id, u.name as user_name, c.content, c.created_at, c.updated_at
		FROM initiative_comments c
		INNER JOIN users u ON u.id = c.user_id
		WHERE c.initiative_id = $1
		ORDER BY c.created_at ASC
	`

	rows, err := r.db.QueryContext(ctx, query, initiativeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []*entities.Comment
	for rows.Next() {
		comment := &entities.Comment{}
		err := rows.Scan(
			&comment.ID,
			&comment.InitiativeID,
			&comment.UserID,
			&comment.UserName,
			&comment.Content,
			&comment.CreatedAt,
			&comment.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		comments = append(comments, comment)
	}

	return comments, nil
}

func (r *CommentRepositoryImpl) CountByInitiative(ctx context.Context, initiativeID int64) (int, error) {
	query := `SELECT COUNT(*) FROM initiative_comments WHERE initiative_id = $1`

	var count int
	err := r.db.QueryRowContext(ctx, query, initiativeID).Scan(&count)
	return count, err
}

package repository_impl

import (
	"context"
	"database/sql"
	"hackathon-backend/domain/entities"
)

type InitiativeHistoryRepositoryImpl struct {
	db *sql.DB
}

func NewInitiativeHistoryRepositoryImpl(db *sql.DB) *InitiativeHistoryRepositoryImpl {
	return &InitiativeHistoryRepositoryImpl{db: db}
}

func (r *InitiativeHistoryRepositoryImpl) Create(ctx context.Context, history *entities.InitiativeHistory) error {
	query := `
		INSERT INTO initiative_history (initiative_id, user_id, old_status, new_status, reason, created_at)
		VALUES ($1, $2, $3, $4, $5, NOW())
		RETURNING id, created_at
	`

	return r.db.QueryRowContext(ctx, query,
		history.InitiativeID,
		history.UserID,
		history.OldStatus,
		history.NewStatus,
		history.Reason,
	).Scan(&history.ID, &history.CreatedAt)
}

func (r *InitiativeHistoryRepositoryImpl) ListByInitiative(ctx context.Context, initiativeID int64) ([]*entities.InitiativeHistory, error) {
	query := `
		SELECT ih.id, ih.initiative_id, ih.user_id, u.name as user_name, 
		       ih.old_status, ih.new_status, ih.reason, ih.created_at
		FROM initiative_history ih
		INNER JOIN users u ON u.id = ih.user_id
		WHERE ih.initiative_id = $1
		ORDER BY ih.created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, initiativeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var histories []*entities.InitiativeHistory
	for rows.Next() {
		history := &entities.InitiativeHistory{}
		var reason sql.NullString

		err := rows.Scan(
			&history.ID,
			&history.InitiativeID,
			&history.UserID,
			&history.UserName,
			&history.OldStatus,
			&history.NewStatus,
			&reason,
			&history.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		if reason.Valid {
			history.Reason = reason.String
		}

		histories = append(histories, history)
	}

	return histories, nil
}

func (r *InitiativeHistoryRepositoryImpl) GetLatestStatus(ctx context.Context, initiativeID int64) (*entities.InitiativeHistory, error) {
	query := `
		SELECT ih.id, ih.initiative_id, ih.user_id, u.name as user_name, 
		       ih.old_status, ih.new_status, ih.reason, ih.created_at
		FROM initiative_history ih
		INNER JOIN users u ON u.id = ih.user_id
		WHERE ih.initiative_id = $1
		ORDER BY ih.created_at DESC
		LIMIT 1
	`

	history := &entities.InitiativeHistory{}
	var reason sql.NullString

	err := r.db.QueryRowContext(ctx, query, initiativeID).Scan(
		&history.ID,
		&history.InitiativeID,
		&history.UserID,
		&history.UserName,
		&history.OldStatus,
		&history.NewStatus,
		&reason,
		&history.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	if reason.Valid {
		history.Reason = reason.String
	}

	return history, nil
}

package repository_impl

import (
	"context"
	"database/sql"
	"fmt"
	"hackathon-backend/domain/entities"
	"strings"
)

type InitiativeRepositoryImpl struct {
	db          *sql.DB
	historyRepo *InitiativeHistoryRepositoryImpl
}

func NewInitiativeRepositoryImpl(db *sql.DB) *InitiativeRepositoryImpl {
	return &InitiativeRepositoryImpl{
		db:          db,
		historyRepo: NewInitiativeHistoryRepositoryImpl(db),
	}
}

func (r *InitiativeRepositoryImpl) Create(ctx context.Context, initiative *entities.Initiative) error {
	query := `
		INSERT INTO initiatives (title, description, benefits, status, type, priority, sector, owner_id, deadline, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRowContext(ctx, query,
		initiative.Title,
		initiative.Description,
		initiative.Benefits,
		initiative.Status,
		initiative.Type,
		initiative.Priority,
		initiative.Sector,
		initiative.OwnerID,
		initiative.Deadline,
	).Scan(&initiative.ID, &initiative.CreatedAt, &initiative.UpdatedAt)

	if err != nil {
		return err
	}

	// Registrar no histórico:  criação da iniciativa
	history := &entities.InitiativeHistory{
		InitiativeID: initiative.ID,
		UserID:       initiative.OwnerID,
		OldStatus:    "Rascunho",
		NewStatus:    initiative.Status,
		Reason:       "Iniciativa criada",
	}

	return r.historyRepo.Create(ctx, history)
}

func (r *InitiativeRepositoryImpl) Update(ctx context.Context, initiative *entities.Initiative) error {
	query := `
		UPDATE initiatives
		SET title = $1, description = $2, benefits = $3, type = $4, priority = $5, sector = $6, deadline = $7, updated_at = NOW()
		WHERE id = $8
		RETURNING updated_at
	`

	return r.db.QueryRowContext(ctx, query,
		initiative.Title,
		initiative.Description,
		initiative.Benefits,
		initiative.Type,
		initiative.Priority,
		initiative.Sector,
		initiative.Deadline,
		initiative.ID,
	).Scan(&initiative.UpdatedAt)
}

func (r *InitiativeRepositoryImpl) Delete(ctx context.Context, initiativeID int64) error {
	query := `DELETE FROM initiatives WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, initiativeID)
	return err
}

func (r *InitiativeRepositoryImpl) GetByID(ctx context.Context, initiativeID int64) (*entities.Initiative, error) {
	query := `
		SELECT i.id, i.title, i.description, i.benefits, i.status, i.type, i.priority, i.sector, 
		       i.owner_id, u.name as owner_name, i.deadline, i.created_at, i.updated_at
		FROM initiatives i
		INNER JOIN users u ON u.id = i.owner_id
		WHERE i.id = $1
	`

	initiative := &entities.Initiative{}
	err := r.db.QueryRowContext(ctx, query, initiativeID).Scan(
		&initiative.ID,
		&initiative.Title,
		&initiative.Description,
		&initiative.Benefits,
		&initiative.Status,
		&initiative.Type,
		&initiative.Priority,
		&initiative.Sector,
		&initiative.OwnerID,
		&initiative.OwnerName,
		&initiative.Deadline,
		&initiative.CreatedAt,
		&initiative.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return initiative, nil
}

// NOVO: GetByID com informação de cancelamento
func (r *InitiativeRepositoryImpl) GetByIDWithCancellation(ctx context.Context, initiativeID int64) (*entities.Initiative, error) {
	query := `
		SELECT i.id, i. title, i.description, i. benefits, i.status, i. type, i.priority, i. sector, 
		       i. owner_id, u.name as owner_name, i.deadline, i.created_at, i. updated_at,
		       cr.id, cr.status, cr.requested_by_user_id, u2.name, cr.reason, 
		       cr.reviewed_by_user_id, u3.name, cr.review_reason, cr.created_at, cr.reviewed_at
		FROM initiatives i
		INNER JOIN users u ON u.id = i. owner_id
		LEFT JOIN initiative_cancellation_requests cr ON cr.initiative_id = i.id 
		    AND cr.status IN ('Pendente', 'Aprovada', 'Reprovada')
		LEFT JOIN users u2 ON u2.id = cr.requested_by_user_id
		LEFT JOIN users u3 ON u3.id = cr.reviewed_by_user_id
		WHERE i.id = $1
		ORDER BY cr.created_at DESC
		LIMIT 1
	`

	initiative := &entities.Initiative{}
	var crID sql.NullInt64
	var crStatus, crRequestedByName, crReason sql.NullString
	var crRequestedByUserID sql.NullInt64
	var crReviewedByUserID sql.NullInt64
	var crReviewedByName, crReviewReason sql.NullString
	var crCreatedAt sql.NullTime
	var crReviewedAt sql.NullTime

	err := r.db.QueryRowContext(ctx, query, initiativeID).Scan(
		&initiative.ID,
		&initiative.Title,
		&initiative.Description,
		&initiative.Benefits,
		&initiative.Status,
		&initiative.Type,
		&initiative.Priority,
		&initiative.Sector,
		&initiative.OwnerID,
		&initiative.OwnerName,
		&initiative.Deadline,
		&initiative.CreatedAt,
		&initiative.UpdatedAt,
		&crID,
		&crStatus,
		&crRequestedByUserID,
		&crRequestedByName,
		&crReason,
		&crReviewedByUserID,
		&crReviewedByName,
		&crReviewReason,
		&crCreatedAt,
		&crReviewedAt,
	)

	if err != nil {
		return nil, err
	}

	// Se existe solicitação de cancelamento
	if crID.Valid {
		cancellationInfo := &entities.InitiativeCancellationInfo{
			ID:                crID.Int64,
			Status:            crStatus.String,
			RequestedByUserID: crRequestedByUserID.Int64,
			RequestedByName:   crRequestedByName.String,
			Reason:            crReason.String,
			CreatedAt:         crCreatedAt.Time,
		}

		if crReviewedByUserID.Valid {
			cancellationInfo.ReviewedByUserID = &crReviewedByUserID.Int64
			cancellationInfo.ReviewedByName = crReviewedByName.String
			cancellationInfo.ReviewReason = crReviewReason.String
		}

		if crReviewedAt.Valid {
			cancellationInfo.ReviewedAt = &crReviewedAt.Time
		}

		initiative.CancellationRequest = cancellationInfo
	}

	return initiative, nil
}

func (r *InitiativeRepositoryImpl) ListAll(ctx context.Context, filter *entities.InitiativeFilter) ([]*entities.Initiative, error) {
	query := `
		SELECT i.id, i.title, i.description, i.benefits, i.status, i.type, i.priority, i.sector, 
		       i.owner_id, u. name as owner_name, i. deadline, i.created_at, i.updated_at
		FROM initiatives i
		INNER JOIN users u ON u.id = i. owner_id
		WHERE 1=1
	`

	var args []interface{}
	argCount := 1

	if filter != nil {
		if filter.Search != "" {
			query += fmt.Sprintf(" AND (LOWER(i.title) LIKE $%d OR LOWER(i. description) LIKE $%d)", argCount, argCount)
			args = append(args, "%"+strings.ToLower(filter.Search)+"%")
			argCount++
		}

		if filter.Status != "" {
			query += fmt.Sprintf(" AND i. status = $%d", argCount)
			args = append(args, filter.Status)
			argCount++
		}

		if filter.Type != "" {
			query += fmt.Sprintf(" AND i.type = $%d", argCount)
			args = append(args, filter.Type)
			argCount++
		}

		if filter.Sector != "" {
			query += fmt.Sprintf(" AND i.sector = $%d", argCount)
			args = append(args, filter.Sector)
			argCount++
		}

		if filter.Priority != "" {
			query += fmt.Sprintf(" AND i. priority = $%d", argCount)
			args = append(args, filter.Priority)
			argCount++
		}
	}

	query += " ORDER BY i.created_at DESC"

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var initiatives []*entities.Initiative
	for rows.Next() {
		initiative := &entities.Initiative{}
		err := rows.Scan(
			&initiative.ID,
			&initiative.Title,
			&initiative.Description,
			&initiative.Benefits,
			&initiative.Status,
			&initiative.Type,
			&initiative.Priority,
			&initiative.Sector,
			&initiative.OwnerID,
			&initiative.OwnerName,
			&initiative.Deadline,
			&initiative.CreatedAt,
			&initiative.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		initiatives = append(initiatives, initiative)
	}

	return initiatives, nil
}

// NOVO: ListAll com informação de cancelamento
// ATUALIZADO: ListAllWithCancellation com filtro por sector_id
func (r *InitiativeRepositoryImpl) ListAllWithCancellation(ctx context.Context, filter *entities.InitiativeFilter) ([]*entities.Initiative, error) {
	query := `
		SELECT i.id, i.title, i.description, i.benefits, i.status, i.type, i.priority, i.sector, 
		       i.owner_id, u.name as owner_name, i.deadline, i.created_at, i.updated_at,
		       cr.id, cr.status, cr.requested_by_user_id, u2.name, cr.reason, 
		       cr.reviewed_by_user_id, u3.name, cr.review_reason, cr.created_at, cr.reviewed_at
		FROM initiatives i
		INNER JOIN users u ON u.id = i.owner_id
		LEFT JOIN LATERAL (
		    SELECT * FROM initiative_cancellation_requests 
		    WHERE initiative_id = i.id 
		    AND status IN ('Pendente', 'Aprovada', 'Reprovada')
		    ORDER BY created_at DESC
		    LIMIT 1
		) cr ON true
		LEFT JOIN users u2 ON u2.id = cr.requested_by_user_id
		LEFT JOIN users u3 ON u3.id = cr.reviewed_by_user_id
		WHERE 1=1
	`

	var args []interface{}
	argCount := 1

	if filter != nil {
		if filter.Search != "" {
			query += fmt.Sprintf(" AND (LOWER(i.title) LIKE $%d OR LOWER(i. description) LIKE $%d)", argCount, argCount)
			args = append(args, "%"+strings.ToLower(filter.Search)+"%")
			argCount++
		}

		if filter.Status != "" {
			query += fmt.Sprintf(" AND i. status = $%d", argCount)
			args = append(args, filter.Status)
			argCount++
		}

		if filter.Type != "" {
			query += fmt.Sprintf(" AND i.type = $%d", argCount)
			args = append(args, filter.Type)
			argCount++
		}

		if filter.Sector != "" {
			query += fmt.Sprintf(" AND i.sector = $%d", argCount)
			args = append(args, filter.Sector)
			argCount++
		}

		// NOVO: Filtrar por sector_id dos owners (usuários do mesmo setor)
		if filter.SectorID != nil {
			query += fmt.Sprintf(" AND u.sector_id = $%d", argCount)
			args = append(args, *filter.SectorID)
			argCount++
		}

		if filter.Priority != "" {
			query += fmt.Sprintf(" AND i.priority = $%d", argCount)
			args = append(args, filter.Priority)
			argCount++
		}
	}

	query += " ORDER BY i.created_at DESC"

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var initiatives []*entities.Initiative
	for rows.Next() {
		initiative := &entities.Initiative{}
		var crID sql.NullInt64
		var crStatus, crRequestedByName, crReason sql.NullString
		var crRequestedByUserID sql.NullInt64
		var crReviewedByUserID sql.NullInt64
		var crReviewedByName, crReviewReason sql.NullString
		var crCreatedAt sql.NullTime
		var crReviewedAt sql.NullTime

		err := rows.Scan(
			&initiative.ID,
			&initiative.Title,
			&initiative.Description,
			&initiative.Benefits,
			&initiative.Status,
			&initiative.Type,
			&initiative.Priority,
			&initiative.Sector,
			&initiative.OwnerID,
			&initiative.OwnerName,
			&initiative.Deadline,
			&initiative.CreatedAt,
			&initiative.UpdatedAt,
			&crID,
			&crStatus,
			&crRequestedByUserID,
			&crRequestedByName,
			&crReason,
			&crReviewedByUserID,
			&crReviewedByName,
			&crReviewReason,
			&crCreatedAt,
			&crReviewedAt,
		)
		if err != nil {
			return nil, err
		}

		// Se existe solicitação de cancelamento
		if crID.Valid {
			cancellationInfo := &entities.InitiativeCancellationInfo{
				ID:                crID.Int64,
				Status:            crStatus.String,
				RequestedByUserID: crRequestedByUserID.Int64,
				RequestedByName:   crRequestedByName.String,
				Reason:            crReason.String,
				CreatedAt:         crCreatedAt.Time,
			}

			if crReviewedByUserID.Valid {
				cancellationInfo.ReviewedByUserID = &crReviewedByUserID.Int64
				cancellationInfo.ReviewedByName = crReviewedByName.String
				cancellationInfo.ReviewReason = crReviewReason.String
			}

			if crReviewedAt.Valid {
				cancellationInfo.ReviewedAt = &crReviewedAt.Time
			}

			initiative.CancellationRequest = cancellationInfo
		}

		initiatives = append(initiatives, initiative)
	}

	return initiatives, nil
}

func (r *InitiativeRepositoryImpl) ChangeStatus(ctx context.Context, initiativeID int64, status, reason string) error {
	// Primeiro, buscar o status atual
	var oldStatus string
	err := r.db.QueryRowContext(ctx, `SELECT status FROM initiatives WHERE id = $1`, initiativeID).Scan(&oldStatus)
	if err != nil {
		return err
	}

	// Atualizar o status
	query := `
		UPDATE initiatives
		SET status = $1, updated_at = NOW()
		WHERE id = $2
	`

	_, err = r.db.ExecContext(ctx, query, status, initiativeID)
	if err != nil {
		return err
	}

	// Registrar no histórico (precisamos do userID, vamos passar pelo contexto depois)
	// Por enquanto vamos usar o owner_id da iniciativa
	var ownerID int64
	r.db.QueryRowContext(ctx, `SELECT owner_id FROM initiatives WHERE id = $1`, initiativeID).Scan(&ownerID)

	history := &entities.InitiativeHistory{
		InitiativeID: initiativeID,
		UserID:       ownerID, // Isso será corrigido no UseCase
		OldStatus:    oldStatus,
		NewStatus:    status,
		Reason:       reason,
	}

	return r.historyRepo.Create(ctx, history)
}

func (r *InitiativeRepositoryImpl) ChangeStatusWithUser(ctx context.Context, initiativeID int64, status, reason string, userID int64) error {
	// Primeiro, buscar o status atual
	var oldStatus string
	err := r.db.QueryRowContext(ctx, `SELECT status FROM initiatives WHERE id = $1`, initiativeID).Scan(&oldStatus)
	if err != nil {
		return err
	}

	// Atualizar o status
	query := `
		UPDATE initiatives
		SET status = $1, updated_at = NOW()
		WHERE id = $2
	`

	_, err = r.db.ExecContext(ctx, query, status, initiativeID)
	if err != nil {
		return err
	}

	// Registrar no histórico
	history := &entities.InitiativeHistory{
		InitiativeID: initiativeID,
		UserID:       userID,
		OldStatus:    oldStatus,
		NewStatus:    status,
		Reason:       reason,
	}

	return r.historyRepo.Create(ctx, history)
}

func (r *InitiativeRepositoryImpl) GetByOwner(ctx context.Context, ownerID int64) ([]*entities.Initiative, error) {
	query := `
		SELECT i.id, i.title, i.description, i.benefits, i.status, i.type, i.priority, i.sector, 
		       i.owner_id, u.name as owner_name, i.deadline, i.created_at, i.updated_at
		FROM initiatives i
		INNER JOIN users u ON u.id = i.owner_id
		WHERE i.owner_id = $1
		ORDER BY i.created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, ownerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var initiatives []*entities.Initiative
	for rows.Next() {
		initiative := &entities.Initiative{}
		err := rows.Scan(
			&initiative.ID,
			&initiative.Title,
			&initiative.Description,
			&initiative.Benefits,
			&initiative.Status,
			&initiative.Type,
			&initiative.Priority,
			&initiative.Sector,
			&initiative.OwnerID,
			&initiative.OwnerName,
			&initiative.Deadline,
			&initiative.CreatedAt,
			&initiative.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		initiatives = append(initiatives, initiative)
	}

	return initiatives, nil
}

package repository_impl

import (
	"context"
	"database/sql"
	"hackathon-backend/domain/entities"
)

type SectorRepositoryImpl struct {
	db *sql.DB
}

func NewSectorRepositoryImpl(db *sql.DB) *SectorRepositoryImpl {
	return &SectorRepositoryImpl{db: db}
}

func (r *SectorRepositoryImpl) Create(ctx context.Context, sector *entities.Sector) error {
	query := `
		INSERT INTO sectors (name, description, active, created_at, updated_at)
		VALUES ($1, $2, $3, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	return r.db.QueryRowContext(ctx, query,
		sector.Name,
		sector.Description,
		sector.Active,
	).Scan(&sector.ID, &sector.CreatedAt, &sector.UpdatedAt)
}

func (r *SectorRepositoryImpl) Update(ctx context.Context, sector *entities.Sector) error {
	query := `
		UPDATE sectors
		SET name = $1, description = $2, active = $3, updated_at = NOW()
		WHERE id = $4
		RETURNING updated_at
	`

	return r.db.QueryRowContext(ctx, query,
		sector.Name,
		sector.Description,
		sector.Active,
		sector.ID,
	).Scan(&sector.UpdatedAt)
}

func (r *SectorRepositoryImpl) Delete(ctx context.Context, sectorID int64) error {
	query := `DELETE FROM sectors WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, sectorID)
	return err
}

func (r *SectorRepositoryImpl) GetByID(ctx context.Context, sectorID int64) (*entities.Sector, error) {
	query := `
		SELECT id, name, description, active, created_at, updated_at
		FROM sectors
		WHERE id = $1
	`

	sector := &entities.Sector{}
	err := r.db.QueryRowContext(ctx, query, sectorID).Scan(
		&sector.ID,
		&sector.Name,
		&sector.Description,
		&sector.Active,
		&sector.CreatedAt,
		&sector.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return sector, nil
}

func (r *SectorRepositoryImpl) GetByName(ctx context.Context, name string) (*entities.Sector, error) {
	query := `
		SELECT id, name, description, active, created_at, updated_at
		FROM sectors
		WHERE name = $1
	`

	sector := &entities.Sector{}
	err := r.db.QueryRowContext(ctx, query, name).Scan(
		&sector.ID,
		&sector.Name,
		&sector.Description,
		&sector.Active,
		&sector.CreatedAt,
		&sector.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return sector, nil
}

func (r *SectorRepositoryImpl) ListAll(ctx context.Context, activeOnly bool) ([]*entities.Sector, error) {
	query := `
		SELECT id, name, description, active, created_at, updated_at
		FROM sectors
		WHERE 1=1
	`

	if activeOnly {
		query += " AND active = true"
	}

	query += " ORDER BY name ASC"

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sectors []*entities.Sector
	for rows.Next() {
		sector := &entities.Sector{}
		err := rows.Scan(
			&sector.ID,
			&sector.Name,
			&sector.Description,
			&sector.Active,
			&sector.CreatedAt,
			&sector.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		sectors = append(sectors, sector)
	}

	return sectors, nil
}

func (r *SectorRepositoryImpl) ListWithUserCount(ctx context.Context, activeOnly bool) ([]*entities.SectorListResponse, error) {
	query := `
		SELECT s.id, s.name, s.description, s.active, COUNT(u.id) as user_count
		FROM sectors s
		LEFT JOIN users u ON u.sector_id = s.id
		WHERE 1=1
	`

	if activeOnly {
		query += " AND s. active = true"
	}

	query += " GROUP BY s. id, s.name, s. description, s.active ORDER BY s.name ASC"

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sectors []*entities.SectorListResponse
	for rows.Next() {
		sector := &entities.SectorListResponse{}
		err := rows.Scan(
			&sector.ID,
			&sector.Name,
			&sector.Description,
			&sector.Active,
			&sector.UserCount,
		)
		if err != nil {
			return nil, err
		}
		sectors = append(sectors, sector)
	}

	return sectors, nil
}

func (r *SectorRepositoryImpl) CountUsersBySector(ctx context.Context, sectorID int64) (int, error) {
	query := `SELECT COUNT(*) FROM users WHERE sector_id = $1`

	var count int
	err := r.db.QueryRowContext(ctx, query, sectorID).Scan(&count)
	return count, err
}