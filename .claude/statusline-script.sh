#!/bin/bash

# Read JSON input from stdin
input=$(cat)

# Extract current directory from JSON
current_dir=$(echo "$input" | jq -r '.workspace.current_dir // .cwd')

# Get username (works in both Git Bash and when called from PowerShell)
username=$(whoami | sed 's/.*\\//')

# Get basename of current directory
dir_name=$(basename "$current_dir")

# Extract token information from JSON
tokens_input=$(echo "$input" | jq -r '.tokens.input // 0' 2>/dev/null || echo "0")
tokens_output=$(echo "$input" | jq -r '.tokens.output // 0' 2>/dev/null || echo "0")
tokens_cache=$(echo "$input" | jq -r '.tokens.cache // 0' 2>/dev/null || echo "0")

# Format token stats (only show if we have token data)
token_info=""
if [ "$tokens_input" != "0" ] || [ "$tokens_output" != "0" ] || [ "$tokens_cache" != "0" ]; then
    token_info=" [${tokens_input}i/${tokens_output}o"
    if [ "$tokens_cache" != "0" ]; then
        token_info="${token_info}/${tokens_cache}c"
    fi
    token_info="${token_info}]"
fi

# Check if we're in a git repository and get comprehensive git status
git_info=""
if git -C "$current_dir" rev-parse --git-dir >/dev/null 2>&1; then
    # Get branch name
    branch=$(git -C "$current_dir" branch --show-current 2>/dev/null || echo "detached")
    
    if [ -n "$branch" ] && [ "$branch" != "detached" ]; then
        git_info=" on $branch"
        
        # Get git status indicators
        status_indicators=""
        
        # Check for uncommitted changes (modified files)
        if ! git -C "$current_dir" diff --quiet 2>/dev/null; then
            status_indicators="${status_indicators}*"
        fi
        
        # Check for staged changes
        if ! git -C "$current_dir" diff --cached --quiet 2>/dev/null; then
            status_indicators="${status_indicators}+"
        fi
        
        # Check for untracked files
        if [ -n "$(git -C "$current_dir" ls-files --others --exclude-standard 2>/dev/null)" ]; then
            status_indicators="${status_indicators}?"
        fi
        
        # Check ahead/behind status with remote
        remote_branch=$(git -C "$current_dir" rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null)
        if [ -n "$remote_branch" ]; then
            ahead=$(git -C "$current_dir" rev-list --count HEAD ^"$remote_branch" 2>/dev/null || echo "0")
            behind=$(git -C "$current_dir" rev-list --count "$remote_branch" ^HEAD 2>/dev/null || echo "0")
            
            if [ "$ahead" -gt 0 ]; then
                status_indicators="${status_indicators}↑${ahead}"
            fi
            if [ "$behind" -gt 0 ]; then
                status_indicators="${status_indicators}↓${behind}"
            fi
        fi
        
        # Add status indicators to git_info if any exist
        if [ -n "$status_indicators" ]; then
            git_info="${git_info} ${status_indicators}"
        fi
    elif [ "$branch" = "detached" ]; then
        # For detached HEAD, show short commit hash
        short_hash=$(git -C "$current_dir" rev-parse --short HEAD 2>/dev/null || echo "unknown")
        git_info=" on ${short_hash}"
    fi
fi

# Output the status line
printf "%s in %s%s%s" "$username" "$dir_name" "$git_info" "$token_info"