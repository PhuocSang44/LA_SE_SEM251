package org.minhtrinh.hcmuttssbackend.dto.forum;

import org.minhtrinh.hcmuttssbackend.entity.VoteType;

public record VoteRequest(
        VoteType voteType
) {}
