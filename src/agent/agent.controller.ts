import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ValidateUser } from 'src/common/decorators/validate-user.decorator';
import { CreateAgentP1Dto } from './dto/create-agent-p1.dto';
import { AgentService } from './agent.service';
import { CreateAgentP2Dto } from './dto/create-agent-p2.dto';
import { AgentGuard } from 'src/common/guards/agent.guard';
import { ValidateAgentOwner } from 'src/common/decorators/validate-agent-owner.decorator';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('phase1')
  createPhase1(
    @ValidateUser() userId: string,
    @Body() createAgentDto: CreateAgentP1Dto,
  ) {
    return this.agentService.createPhase1(userId, createAgentDto);
  }

  @UseGuards(AgentGuard)
  @Post('phase2/:agentId')
  createPhase2(
    @Body() createAgentDto: CreateAgentP2Dto,
    @ValidateAgentOwner() agentId: string,
  ) {
    return this.agentService.createPhase2(createAgentDto, agentId);
  }
}
