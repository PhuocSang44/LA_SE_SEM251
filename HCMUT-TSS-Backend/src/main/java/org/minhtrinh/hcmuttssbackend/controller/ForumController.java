package org.minhtrinh.hcmuttssbackend.controller;

import lombok.RequiredArgsConstructor;
import org.minhtrinh.hcmuttssbackend.TssUserPrincipal;
import org.minhtrinh.hcmuttssbackend.dto.forum.*;
import org.minhtrinh.hcmuttssbackend.entity.ForumType;
import org.minhtrinh.hcmuttssbackend.service.ForumService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forums")
@RequiredArgsConstructor
public class ForumController {

    private final ForumService forumService;

    // ===================== FORUM MANAGEMENT =====================

    @PostMapping
    @PreAuthorize("hasAnyAuthority('STAFF')")
    public ResponseEntity<ForumResponse> createForum(
            @RequestBody CreateForumRequest request,
            @AuthenticationPrincipal TssUserPrincipal principal) {
        ForumResponse response = forumService.createForum(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ForumResponse>> getAllForums(
            @RequestParam(required = false) ForumType forumType,
            @AuthenticationPrincipal TssUserPrincipal principal) {
        List<ForumResponse> forums = forumService.getAllForums(forumType, principal);
        return ResponseEntity.ok(forums);
    }

    @GetMapping("/{forumId}")
    public ResponseEntity<ForumResponse> getForumById(
            @PathVariable Long forumId,
            @AuthenticationPrincipal TssUserPrincipal principal) {
        ForumResponse forum = forumService.getForumById(forumId, principal);
        return ResponseEntity.ok(forum);
    }

    @DeleteMapping("/{forumId}")
    @PreAuthorize("hasAnyAuthority('STAFF')")
    public ResponseEntity<Void> deleteForum(
            @PathVariable Long forumId,
            @AuthenticationPrincipal TssUserPrincipal principal) {
        forumService.deleteForum(forumId, principal);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<ForumResponse>> searchForums(
            @RequestParam String query,
            @RequestParam(required = false) ForumType forumType,
            @AuthenticationPrincipal TssUserPrincipal principal) {
        List<ForumResponse> forums = forumService.searchForums(query, forumType, principal);
        return ResponseEntity.ok(forums);
    }

    // ===================== FORUM MEMBERSHIP =====================

    @PostMapping("/{forumId}/join")
    public ResponseEntity<Void> joinForum(
            @PathVariable Long forumId,
            @AuthenticationPrincipal TssUserPrincipal principal) {
        forumService.joinForum(forumId, principal);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{forumId}/leave")
    public ResponseEntity<Void> leaveForum(
            @PathVariable Long forumId,
            @AuthenticationPrincipal TssUserPrincipal principal) {
        forumService.leaveForum(forumId, principal);
        return ResponseEntity.noContent().build();
    }

    // ===================== POST MANAGEMENT =====================

    @PostMapping("/posts")
    public ResponseEntity<PostResponse> createPost(
            @RequestBody CreatePostRequest request,
            @AuthenticationPrincipal TssUserPrincipal principal) {
        PostResponse response = forumService.createPost(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{forumId}/posts")
    public ResponseEntity<List<PostResponse>> getPostsByForum(
            @PathVariable Long forumId,
            @AuthenticationPrincipal TssUserPrincipal principal) {
        List<PostResponse> posts = forumService.getPostsByForum(forumId, principal);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/posts/{postId}")
    public ResponseEntity<PostResponse> getPostById(
            @PathVariable Long postId,
            @AuthenticationPrincipal TssUserPrincipal principal) {
        PostResponse post = forumService.getPostById(postId, principal);
        return ResponseEntity.ok(post);
    }

    @GetMapping("/{forumId}/posts/search")
    public ResponseEntity<List<PostResponse>> searchPostsInForum(
            @PathVariable Long forumId,
            @RequestParam String query,
            @AuthenticationPrincipal TssUserPrincipal principal) {
        List<PostResponse> posts = forumService.searchPostsInForum(forumId, query, principal);
        return ResponseEntity.ok(posts);
    }

    // ===================== COMMENT MANAGEMENT =====================

    @PostMapping("/comments")
    public ResponseEntity<CommentResponse> createComment(
            @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal TssUserPrincipal principal) {
        CommentResponse response = forumService.createComment(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<CommentResponse>> getCommentsByPost(
            @PathVariable Long postId,
            @AuthenticationPrincipal TssUserPrincipal principal) {
        List<CommentResponse> comments = forumService.getCommentsByPost(postId, principal);
        return ResponseEntity.ok(comments);
    }

    @PatchMapping("/comments/{commentId}/accept")
    public ResponseEntity<CommentResponse> acceptComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal TssUserPrincipal principal) {
        CommentResponse response = forumService.acceptComment(commentId, principal);
        return ResponseEntity.ok(response);
    }

    // ===================== VOTING SYSTEM =====================

    @PostMapping("/posts/{postId}/vote")
    public ResponseEntity<Void> votePost(
            @PathVariable Long postId,
            @RequestBody VoteRequest request,
            @AuthenticationPrincipal TssUserPrincipal principal) {
        forumService.votePost(postId, request, principal);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/comments/{commentId}/vote")
    public ResponseEntity<Void> voteComment(
            @PathVariable Long commentId,
            @RequestBody VoteRequest request,
            @AuthenticationPrincipal TssUserPrincipal principal) {
        forumService.voteComment(commentId, request, principal);
        return ResponseEntity.ok().build();
    }
}
