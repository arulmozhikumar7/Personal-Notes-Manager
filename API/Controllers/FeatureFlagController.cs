using Microsoft.AspNetCore.Mvc;
using PersonalNotesManager.Models;

namespace PersonalNotesManager.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FeatureFlagController : ControllerBase
    {
        private readonly FeatureFlags _featureFlags;

        public FeatureFlagController(FeatureFlags featureFlags)
        {
            _featureFlags = featureFlags;
        }

        [HttpGet]
        public IActionResult GetFeatureFlags()
        {
            return Ok(new
            {
                pdfExport = _featureFlags.EnablePdfExport,
                imageExport = _featureFlags.EnableImageExport,
                htmlExport = _featureFlags.EnableHtmlExport
            });
        }
    }
}
