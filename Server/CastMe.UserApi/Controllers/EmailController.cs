using Application.Dtos;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

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

        //<summary>Send an email.</summary>
        [HttpPost("send")]
        [ProducesResponseType(200)]
        public async Task<IActionResult> Send([FromBody] EmailForm dto)
        {
            await _emailSender.SendEmailAsync(dto);
            return Ok(new { Message = "Email sent" });
        }



    }
}
