export interface ChatMessageDto {
  id?: number
  username: string
  avatar: string
  message: string
}

export interface ChatPollResponseDto {
  ok: boolean
  messages?: ChatMessageDto[]
}
