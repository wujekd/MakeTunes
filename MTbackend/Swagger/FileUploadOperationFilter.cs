using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Reflection;

namespace MTbackend.Swagger;

public class FileUploadOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        // Look for parameters bound from form data
        var formParam = context.MethodInfo.GetParameters()
            .FirstOrDefault(p =>
                p.GetCustomAttribute<Microsoft.AspNetCore.Mvc.FromFormAttribute>() != null ||
                (p.ParameterType.IsClass && p.ParameterType.GetProperties().Any(prop => prop.PropertyType == typeof(IFormFile)))
            );

        if (formParam == null) return;

        var schema = new OpenApiSchema
        {
            Type = "object",
            Properties = new Dictionary<string, OpenApiSchema>()
        };

        var paramType = formParam.ParameterType;

        // If it's a direct IFormFile, add only that
        if (paramType == typeof(IFormFile))
        {
            schema.Properties[formParam.Name ?? "file"] = new OpenApiSchema
            {
                Type = "string",
                Format = "binary"
            };
        }
        else
        {
            // Assume it's a DTO: loop through props
            foreach (var prop in paramType.GetProperties(BindingFlags.Public | BindingFlags.Instance))
            {
                var openApiProp = new OpenApiSchema
                {
                    Type = MapType(prop.PropertyType),
                    Format = MapFormat(prop.PropertyType)
                };

                // For IFormFile, override
                if (prop.PropertyType == typeof(IFormFile))
                {
                    openApiProp.Type = "string";
                    openApiProp.Format = "binary";
                }

                schema.Properties[prop.Name] = openApiProp;
            }
        }

        operation.RequestBody = new OpenApiRequestBody
        {
            Content = new Dictionary<string, OpenApiMediaType>
            {
                ["multipart/form-data"] = new OpenApiMediaType
                {
                    Schema = schema
                }
            }
        };
    }

    private string MapType(Type type)
    {
        if (type == typeof(int) || type == typeof(long)) return "integer";
        if (type == typeof(float) || type == typeof(double) || type == typeof(decimal)) return "number";
        if (type == typeof(bool)) return "boolean";
        return "string"; // default fallback (includes DateTime, string, etc.)
    }

    private string? MapFormat(Type type)
    {
        if (type == typeof(int)) return "int32";
        if (type == typeof(long)) return "int64";
        if (type == typeof(float)) return "float";
        if (type == typeof(double)) return "double";
        if (type == typeof(decimal)) return "decimal";
        if (type == typeof(DateTime)) return "date-time";
        return null;
    }
}
