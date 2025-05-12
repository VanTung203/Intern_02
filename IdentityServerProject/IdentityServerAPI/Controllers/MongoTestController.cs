using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace IdentityServerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MongoTestController : ControllerBase
    {
        private readonly IMongoDatabase _database;

        public MongoTestController(IMongoDatabase database)
        {
            _database = database;
        }

        [HttpGet]
        public IActionResult Get()
        {
            // Lấy một collection mẫu để kiểm tra kết nối
            var collection = _database.GetCollection<dynamic>("testCollection");
            var testDocument = collection.Find(_ => true).FirstOrDefault();
            
            if (testDocument == null)
            {
                return NotFound("No data found in MongoDB.");
            }

            return Ok(testDocument);
        }
    }
}
