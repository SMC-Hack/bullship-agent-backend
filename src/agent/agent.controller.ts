import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ValidateUser } from 'src/common/decorators/validate-user.decorator';
import { CreateAgentDto } from './dto/create-agent.dto';
import { AgentService } from './agent.service';
import { CreateAgentTokenDto } from './dto/create-agent-token.dto';
import { AgentGuard } from 'src/common/guards/agent.guard';
import { ValidateAgentOwner } from 'src/common/decorators/validate-agent-owner.decorator';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post()
  createAgent(
    @ValidateUser() userId: string,
    @Body() createAgentDto: CreateAgentDto,
  ) {
    return this.agentService.createAgent(userId, createAgentDto);
  }

  @UseGuards(AgentGuard)
  @Post(':agentId/token')
  createToken(
    @Body() createAgentDto: CreateAgentTokenDto,
    @ValidateAgentOwner() agentId: string,
  ) {
    return this.agentService.createAgentToken(createAgentDto, agentId);
  }
}
