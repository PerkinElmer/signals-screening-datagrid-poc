    /**
     Checks the type of a given object.

     @param obj the object to check.
     @returns one of; "boolean", "number", "string", "object",
      "function", or "null".
    */

    function typeOf (obj)
    {
        type = typeof obj;
        return type === "object" && !obj ? "null" : type;
    }

    /**
     Introspects an object.

     @param name the object name.
     @param obj the object to introspect.
     @param indent the indentation (optional, defaults to "").
     @param levels the introspection nesting level (defaults to 10).
     @returns a plain text analysis of the object.
    */

    function introspect (name, obj, indent, levels)
    {
        indent = indent || "";

        if (this.typeOf(levels) !== "number") levels = 10;

        var objType = this.typeOf(obj);
        var result = [indent, name, " ", objType, " :"].join('');

        if (objType === "object")
        {
            if (levels > 0)
            {
                indent = [indent, "  "].join('');

                for (prop in obj)
                {
                    var prop = this.introspect(prop, obj[prop], indent, levels - 1);
                    result = [result, "\n", prop].join('');
                }

                return result;
            }
            else
            {
                return [result, " ..."].join('');
           }
        }
        else if (objType === "null")
        {
            return [result, " null"].join('');
        }

        return [result, " ", obj].join('');
    }
