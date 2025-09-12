using Application.Dtos;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using WebApi.Endpoints;
using WebApi.Extensions;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("email")]
    [Tags("Emails")]
    [Produces("application/json")]
    public class EmailController : ControllerBase
    {
        private readonly IEmailSender _emailSender;

        public EmailController(IEmailSender emailSender)
        {
            _emailSender = emailSender;
        }


        [HttpPost(EmailEndpoints.SendEmail)]
        [ProducesResponseType(200)]
        [RoleAuthorize("Admin")]
        public async Task<IActionResult> SendEmail([FromBody] EmailDto.Send dto)
        {
            await _emailSender.SendEmailAsync(dto);
            return Ok(new { Message = "Email sent" });
        }
        [HttpPost(EmailEndpoints.SendForm)]
        [ProducesResponseType(200)]
        [EnableRateLimiting("ContactFormLimiter")]
        public async Task<IActionResult> EmailForm([FromBody] EmailDto.Form dto)
        {
            await _emailSender.SendFormAsync(dto);
            return Ok(new { Message = "Email sent" });
        }



    }
}
